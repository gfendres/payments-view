import { describe, test, expect } from 'bun:test';
import { Session } from '../session';
import { EthereumAddress } from '../../../transaction/value-objects/ethereum-address';
import { TokenExpiredError } from '../../../shared/errors';
import { AUTH_CONFIG } from '@payments-view/constants';

describe('Session', () => {
  const address = EthereumAddress.fromTrusted('0x1234567890123456789012345678901234567890');
  const token = 'test-token';
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3600000); // 1 hour from now
  const createdAt = now;

  describe('create', () => {
    test('should create session with required fields', () => {
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt,
        createdAt,
      });

      expect(session.walletAddress).toBe(address);
      expect(session.token).toBe(token);
      expect(session.expiresAt).toEqual(expiresAt);
      expect(session.createdAt).toEqual(createdAt);
    });
  });

  describe('walletAddress', () => {
    test('should return wallet address', () => {
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt,
        createdAt,
      });

      expect(session.walletAddress).toBe(address);
    });
  });

  describe('token', () => {
    test('should return token', () => {
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt,
        createdAt,
      });

      expect(session.token).toBe(token);
    });
  });

  describe('expiresAt', () => {
    test('should return expiration date', () => {
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt,
        createdAt,
      });

      expect(session.expiresAt).toEqual(expiresAt);
    });
  });

  describe('createdAt', () => {
    test('should return creation date', () => {
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt,
        createdAt,
      });

      expect(session.createdAt).toEqual(createdAt);
    });
  });

  describe('isExpired', () => {
    test('should return false for valid session', () => {
      const futureExpiry = new Date(Date.now() + 3600000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: futureExpiry,
        createdAt,
      });

      expect(session.isExpired).toBe(false);
    });

    test('should return true for expired session', () => {
      const pastExpiry = new Date(Date.now() - 1000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: pastExpiry,
        createdAt,
      });

      expect(session.isExpired).toBe(true);
    });
  });

  describe('needsRefresh', () => {
    test('should return false when far from expiry', () => {
      const futureExpiry = new Date(Date.now() + 7200000); // 2 hours
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: futureExpiry,
        createdAt,
      });

      expect(session.needsRefresh).toBe(false);
    });

    test('should return true when within buffer time', () => {
      const buffer = AUTH_CONFIG.JWT_EXPIRY_BUFFER_MS;
      const nearExpiry = new Date(Date.now() + buffer / 2);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: nearExpiry,
        createdAt,
      });

      expect(session.needsRefresh).toBe(true);
    });
  });

  describe('timeUntilExpiry', () => {
    test('should return time until expiry', () => {
      const futureExpiry = new Date(Date.now() + 3600000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: futureExpiry,
        createdAt,
      });

      const timeUntil = session.timeUntilExpiry;
      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThanOrEqual(3600000);
    });

    test('should return 0 for expired session', () => {
      const pastExpiry = new Date(Date.now() - 1000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: pastExpiry,
        createdAt,
      });

      expect(session.timeUntilExpiry).toBe(0);
    });
  });

  describe('ensureValid', () => {
    test('should not throw for valid session', () => {
      const futureExpiry = new Date(Date.now() + 3600000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: futureExpiry,
        createdAt,
      });

      expect(() => session.ensureValid()).not.toThrow();
    });

    test('should throw TokenExpiredError for expired session', () => {
      const pastExpiry = new Date(Date.now() - 1000);
      const session = Session.create({
        walletAddress: address,
        token,
        expiresAt: pastExpiry,
        createdAt,
      });

      expect(() => session.ensureValid()).toThrow(TokenExpiredError);
    });
  });
});

