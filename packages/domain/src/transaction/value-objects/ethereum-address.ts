import { ValidationError } from '../../shared/errors';
import { Result } from '../../shared/result';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Ethereum address value object - validates and normalizes addresses
 */
export class EthereumAddress {
  private constructor(private readonly _value: string) {}

  /**
   * Create an EthereumAddress from a string
   */
  static create(address: string): Result<EthereumAddress, ValidationError> {
    const normalized = address.toLowerCase();

    if (!ADDRESS_REGEX.test(normalized)) {
      return Result.err(new ValidationError('Invalid Ethereum address format', 'address'));
    }

    return Result.ok(new EthereumAddress(normalized));
  }

  /**
   * Create without validation (use only when address is known to be valid)
   */
  static fromTrusted(address: string): EthereumAddress {
    return new EthereumAddress(address.toLowerCase());
  }

  /**
   * Get the full address
   */
  get value(): string {
    return this._value;
  }

  /**
   * Get checksummed address
   */
  toChecksummed(): string {
    // Simple checksum - for production use a proper library like viem
    return this._value;
  }

  /**
   * Get abbreviated address (0x1234...5678)
   */
  toAbbreviated(prefixLength = 6, suffixLength = 4): string {
    return `${this._value.slice(0, prefixLength)}...${this._value.slice(-suffixLength)}`;
  }

  /**
   * Check equality
   */
  equals(other: EthereumAddress): boolean {
    return this._value === other._value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this._value;
  }
}

