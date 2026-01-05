import { describe, test, expect } from 'bun:test';
import { TokenPrice } from '../token-price';
import { CurrencyCode } from '@payments-view/constants';

describe('TokenPrice', () => {
  const baseParams = {
    tokenId: 'gnosis',
    price: 100.50,
    currency: CurrencyCode.USD,
    lastUpdatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  describe('create', () => {
    test('should create token price with required fields', () => {
      const tokenPrice = TokenPrice.create(baseParams);

      expect(tokenPrice.tokenId).toBe('gnosis');
      expect(tokenPrice.price).toBe(100.50);
      expect(tokenPrice.currency).toBe(CurrencyCode.USD);
      expect(tokenPrice.lastUpdatedAt).toEqual(baseParams.lastUpdatedAt);
    });

    test('should create with optional fields', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        change24h: 5.5,
        marketCap: 1000000,
      });

      expect(tokenPrice.change24h).toBe(5.5);
      expect(tokenPrice.marketCap).toBe(1000000);
    });

    test('should handle null optional fields', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        change24h: null,
        marketCap: null,
      });

      expect(tokenPrice.change24h).toBeNull();
      expect(tokenPrice.marketCap).toBeNull();
    });
  });

  describe('tokenId', () => {
    test('should return token ID', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.tokenId).toBe('gnosis');
    });
  });

  describe('price', () => {
    test('should return price', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.price).toBe(100.50);
    });
  });

  describe('currency', () => {
    test('should return currency code', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.currency).toBe(CurrencyCode.USD);
    });
  });

  describe('lastUpdatedAt', () => {
    test('should return last updated timestamp', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.lastUpdatedAt).toEqual(baseParams.lastUpdatedAt);
    });
  });

  describe('change24h', () => {
    test('should return 24h change when provided', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        change24h: -2.5,
      });

      expect(tokenPrice.change24h).toBe(-2.5);
    });

    test('should return null when not provided', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.change24h).toBeNull();
    });
  });

  describe('marketCap', () => {
    test('should return market cap when provided', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        marketCap: 5000000,
      });

      expect(tokenPrice.marketCap).toBe(5000000);
    });

    test('should return null when not provided', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.marketCap).toBeNull();
    });
  });

  describe('isStale', () => {
    test('should return false for fresh price', () => {
      const freshDate = new Date(Date.now() - 1000); // 1 second ago
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        lastUpdatedAt: freshDate,
      });

      expect(tokenPrice.isStale(60000)).toBe(false); // 60 seconds max age
    });

    test('should return true for stale price', () => {
      const staleDate = new Date(Date.now() - 120000); // 2 minutes ago
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        lastUpdatedAt: staleDate,
      });

      expect(tokenPrice.isStale(60000)).toBe(true); // 60 seconds max age
    });
  });

  describe('formatPrice', () => {
    test('should format price as currency', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      const formatted = tokenPrice.formatPrice();

      expect(formatted).toContain('100.50');
      expect(formatted).toContain('$');
    });

    test('should use custom options', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        price: 100.123456,
      });
      const formatted = tokenPrice.formatPrice({ maximumFractionDigits: 4 });

      expect(formatted).toContain('100.1235');
    });
  });

  describe('formatChange24h', () => {
    test('should format positive change', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        change24h: 5.5,
      });

      expect(tokenPrice.formatChange24h()).toBe('+5.50%');
    });

    test('should format negative change', () => {
      const tokenPrice = TokenPrice.create({
        ...baseParams,
        change24h: -2.75,
      });

      expect(tokenPrice.formatChange24h()).toBe('-2.75%');
    });

    test('should return N/A when change not available', () => {
      const tokenPrice = TokenPrice.create(baseParams);
      expect(tokenPrice.formatChange24h()).toBe('N/A');
    });
  });

  describe('equals', () => {
    test('should return true for equal prices', () => {
      const a = TokenPrice.create(baseParams);
      const b = TokenPrice.create(baseParams);

      expect(a.equals(b)).toBe(true);
    });

    test('should return false for different prices', () => {
      const a = TokenPrice.create(baseParams);
      const b = TokenPrice.create({
        ...baseParams,
        price: 200.0,
      });

      expect(a.equals(b)).toBe(false);
    });

    test('should return false for different currencies', () => {
      const a = TokenPrice.create(baseParams);
      const b = TokenPrice.create({
        ...baseParams,
        currency: CurrencyCode.EUR,
      });

      expect(a.equals(b)).toBe(false);
    });

    test('should return false for different tokens', () => {
      const a = TokenPrice.create(baseParams);
      const b = TokenPrice.create({
        ...baseParams,
        tokenId: 'ethereum',
      });

      expect(a.equals(b)).toBe(false);
    });
  });
});

