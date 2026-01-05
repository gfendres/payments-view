import { describe, test, expect } from 'bun:test';
import { EthereumAddress } from '../ethereum-address';
import { ValidationError } from '../../../shared/errors';

describe('EthereumAddress', () => {
  const validAddress = '0x1234567890123456789012345678901234567890';
  const validAddressUpper = '0x1234567890123456789012345678901234567890'.toUpperCase();

  describe('create', () => {
    test('should create address from valid string', () => {
      const result = EthereumAddress.create(validAddress);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe(validAddress.toLowerCase());
      }
    });

    test('should normalize to lowercase', () => {
      const result = EthereumAddress.create(validAddressUpper);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe(validAddress.toLowerCase());
      }
    });

    test('should reject invalid format - too short', () => {
      const result = EthereumAddress.create('0x123');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    test('should reject invalid format - missing 0x prefix', () => {
      const result = EthereumAddress.create(validAddress.slice(2));

      expect(result.isFailure).toBe(true);
    });

    test('should reject invalid format - invalid characters', () => {
      const result = EthereumAddress.create('0x123456789012345678901234567890123456789g');

      expect(result.isFailure).toBe(true);
    });

    test('should reject empty string', () => {
      const result = EthereumAddress.create('');

      expect(result.isFailure).toBe(true);
    });
  });

  describe('fromTrusted', () => {
    test('should create address without validation', () => {
      const address = EthereumAddress.fromTrusted(validAddress);

      expect(address.value).toBe(validAddress.toLowerCase());
    });

    test('should normalize to lowercase', () => {
      const address = EthereumAddress.fromTrusted(validAddressUpper);

      expect(address.value).toBe(validAddress.toLowerCase());
    });
  });

  describe('value', () => {
    test('should return normalized address', () => {
      const address = EthereumAddress.fromTrusted(validAddressUpper);

      expect(address.value).toBe(validAddress.toLowerCase());
    });
  });

  describe('toChecksummed', () => {
    test('should return checksummed address', () => {
      const address = EthereumAddress.fromTrusted(validAddress);
      const checksummed = address.toChecksummed();

      expect(typeof checksummed).toBe('string');
      expect(checksummed).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe('toAbbreviated', () => {
    test('should abbreviate address with default lengths', () => {
      const address = EthereumAddress.fromTrusted(validAddress);
      const abbreviated = address.toAbbreviated();

      expect(abbreviated).toBe('0x1234...7890');
    });

    test('should abbreviate with custom lengths', () => {
      const address = EthereumAddress.fromTrusted(validAddress);
      const abbreviated = address.toAbbreviated(4, 6);

      expect(abbreviated).toBe('0x12...567890');
    });
  });

  describe('equals', () => {
    test('should return true for equal addresses', () => {
      const a = EthereumAddress.fromTrusted(validAddress);
      const b = EthereumAddress.fromTrusted(validAddressUpper);

      expect(a.equals(b)).toBe(true);
    });

    test('should return false for different addresses', () => {
      const a = EthereumAddress.fromTrusted(validAddress);
      const b = EthereumAddress.fromTrusted('0x9876543210987654321098765432109876543210');

      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return address string', () => {
      const address = EthereumAddress.fromTrusted(validAddress);

      expect(address.toString()).toBe(validAddress.toLowerCase());
    });
  });
});

