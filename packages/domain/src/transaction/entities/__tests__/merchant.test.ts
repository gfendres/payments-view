import { describe, test, expect } from 'bun:test';
import { Merchant } from '../merchant';

describe('Merchant', () => {
  const baseProps = {
    name: 'Test Store',
    mcc: '5411',
  };

  describe('create', () => {
    test('should create merchant with required fields', () => {
      const merchant = Merchant.create(baseProps);

      expect(merchant.name).toBe('Test Store');
      expect(merchant.mcc).toBe('5411');
    });

    test('should create merchant with optional fields', () => {
      const merchant = Merchant.create({
        ...baseProps,
        city: 'Berlin',
        country: 'Germany',
      });

      expect(merchant.city).toBe('Berlin');
      expect(merchant.country).toBe('Germany');
    });

    test('should create category from MCC', () => {
      const merchant = Merchant.create(baseProps);

      expect(merchant.category).toBeDefined();
      expect(merchant.category.id).toBeDefined();
    });
  });

  describe('name', () => {
    test('should return merchant name', () => {
      const merchant = Merchant.create(baseProps);
      expect(merchant.name).toBe('Test Store');
    });
  });

  describe('city', () => {
    test('should return city when provided', () => {
      const merchant = Merchant.create({
        ...baseProps,
        city: 'Berlin',
      });

      expect(merchant.city).toBe('Berlin');
    });

    test('should return undefined when not provided', () => {
      const merchant = Merchant.create(baseProps);
      expect(merchant.city).toBeUndefined();
    });
  });

  describe('country', () => {
    test('should return country when provided', () => {
      const merchant = Merchant.create({
        ...baseProps,
        country: 'Germany',
      });

      expect(merchant.country).toBe('Germany');
    });

    test('should return undefined when not provided', () => {
      const merchant = Merchant.create(baseProps);
      expect(merchant.country).toBeUndefined();
    });
  });

  describe('mcc', () => {
    test('should return MCC code', () => {
      const merchant = Merchant.create(baseProps);
      expect(merchant.mcc).toBe('5411');
    });
  });

  describe('category', () => {
    test('should return category from MCC', () => {
      const merchant = Merchant.create(baseProps);

      expect(merchant.category).toBeDefined();
      expect(merchant.category.id).toBeDefined();
    });
  });

  describe('location', () => {
    test('should return formatted location with city and country', () => {
      const merchant = Merchant.create({
        ...baseProps,
        city: 'Berlin',
        country: 'Germany',
      });

      expect(merchant.location).toBe('Berlin, Germany');
    });

    test('should return city only when country missing', () => {
      const merchant = Merchant.create({
        ...baseProps,
        city: 'Berlin',
      });

      expect(merchant.location).toBe('Berlin');
    });

    test('should return country only when city missing', () => {
      const merchant = Merchant.create({
        ...baseProps,
        country: 'Germany',
      });

      expect(merchant.location).toBe('Germany');
    });

    test('should return undefined when both missing', () => {
      const merchant = Merchant.create(baseProps);
      expect(merchant.location).toBeUndefined();
    });
  });
});

