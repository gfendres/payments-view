import type { EthereumAddress } from '../../transaction/value-objects/ethereum-address';
import { TokenExpiredError } from '../../shared/errors';
import { AUTH_CONFIG } from '@payments-view/constants';

/**
 * Session entity props
 */
export interface SessionProps {
  walletAddress: EthereumAddress;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Session entity - represents an authenticated session
 */
export class Session {
  private readonly _walletAddress: EthereumAddress;
  private readonly _token: string;
  private readonly _expiresAt: Date;
  private readonly _createdAt: Date;

  private constructor(props: SessionProps) {
    this._walletAddress = props.walletAddress;
    this._token = props.token;
    this._expiresAt = props.expiresAt;
    this._createdAt = props.createdAt;
  }

  /**
   * Create a Session entity
   */
  static create(props: SessionProps): Session {
    return new Session(props);
  }

  get walletAddress(): EthereumAddress {
    return this._walletAddress;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Check if session is expired
   */
  get isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  /**
   * Check if session needs refresh (within buffer time of expiry)
   */
  get needsRefresh(): boolean {
    const bufferTime = AUTH_CONFIG.JWT_EXPIRY_BUFFER_MS;
    const refreshThreshold = new Date(this._expiresAt.getTime() - bufferTime);
    return new Date() >= refreshThreshold;
  }

  /**
   * Get time until expiry in milliseconds
   */
  get timeUntilExpiry(): number {
    return Math.max(0, this._expiresAt.getTime() - Date.now());
  }

  /**
   * Ensure session is valid (throws if expired)
   */
  ensureValid(): void {
    if (this.isExpired) {
      throw new TokenExpiredError();
    }
  }
}
