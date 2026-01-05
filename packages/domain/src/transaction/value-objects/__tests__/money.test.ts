import { describe, test, expect } from 'bun:test';
import { Money } from '../money';
import { CurrencyCode } from '@payments-view/constants';

describe('Money', () => {
  describe('create', () => {
    test('should create money from string amount', () => {
      const money = Money.create('2550', CurrencyCode.EUR);
      expect(money.amountSmallest).toBe(2550n);
      expect(money.currency).toBe(CurrencyCode.EUR);
      expect(money.decimals).toBe(2);
    });

    test('should use custom decimals when provided', () => {
      const money = Money.create('1000000', CurrencyCode.USD, 6);
      expect(money.decimals).toBe(6);
      expect(money.amountSmallest).toBe(1000000n);
    });

    test('should handle zero amount', () => {
      const money = Money.create('0', CurrencyCode.EUR);
      expect(money.amountSmallest).toBe(0n);
      expect(money.isZero()).toBe(true);
    });
  });

  describe('fromNumber', () => {
    test('should create money from number', () => {
      const money = Money.fromNumber(25.50, CurrencyCode.EUR);
      expect(money.toNumber()).toBeCloseTo(25.50, 2);
    });

    test('should handle negative amounts', () => {
      const money = Money.fromNumber(-10.25, CurrencyCode.EUR);
      expect(money.toNumber()).toBeCloseTo(-10.25, 2);
      expect(money.isNegative()).toBe(true);
    });

    test('should round correctly', () => {
      const money = Money.fromNumber(10.999, CurrencyCode.EUR);
      expect(money.toNumber()).toBeCloseTo(11.00, 2);
    });
  });

  describe('zero', () => {
    test('should create zero money', () => {
      const zero = Money.zero(CurrencyCode.EUR);
      expect(zero.isZero()).toBe(true);
      expect(zero.currency).toBe(CurrencyCode.EUR);
    });
  });

  describe('toNumber', () => {
    test('should convert to number correctly', () => {
      const money = Money.create('2550', CurrencyCode.EUR);
      expect(money.toNumber()).toBe(25.50);
    });

    test('should handle different decimal places', () => {
      const money = Money.create('1000000', CurrencyCode.USD, 6);
      expect(money.toNumber()).toBe(1.0);
    });
  });

  describe('format', () => {
    test('should format EUR correctly', () => {
      const money = Money.create('2550', CurrencyCode.EUR);
      const formatted = money.format();
      expect(formatted).toContain('25.50');
      expect(formatted).toContain('€');
    });

    test('should format USD correctly', () => {
      const money = Money.create('10000', CurrencyCode.USD);
      const formatted = money.format();
      expect(formatted).toContain('100.00');
      expect(formatted).toContain('$');
    });

    test('should use custom locale', () => {
      const money = Money.create('10000', CurrencyCode.EUR);
      const formatted = money.format('de-DE');
      expect(formatted).toContain('100,00');
    });
  });

  describe('formatSimple', () => {
    test('should format with symbol only', () => {
      const money = Money.create('2550', CurrencyCode.EUR);
      const formatted = money.formatSimple();
      expect(formatted).toBe('€25.50');
    });

    test('should handle different currencies', () => {
      const money = Money.create('10000', CurrencyCode.USD);
      const formatted = money.formatSimple();
      expect(formatted).toBe('$100.00');
    });
  });

  describe('add', () => {
    test('should add two money values', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('500', CurrencyCode.EUR);
      const result = a.add(b);

      expect(result.toNumber()).toBe(15.0);
      expect(result.currency).toBe(CurrencyCode.EUR);
    });

    test('should throw error for different currencies', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('1000', CurrencyCode.USD);

      expect(() => a.add(b)).toThrow('Cannot operate on different currencies');
    });
  });

  describe('subtract', () => {
    test('should subtract money values', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('300', CurrencyCode.EUR);
      const result = a.subtract(b);

      expect(result.toNumber()).toBe(7.0);
    });

    test('should handle negative results', () => {
      const a = Money.create('500', CurrencyCode.EUR);
      const b = Money.create('1000', CurrencyCode.EUR);
      const result = a.subtract(b);

      expect(result.toNumber()).toBe(-5.0);
      expect(result.isNegative()).toBe(true);
    });
  });

  describe('multiply', () => {
    test('should multiply by factor', () => {
      const money = Money.create('1000', CurrencyCode.EUR);
      const result = money.multiply(2.5);

      expect(result.toNumber()).toBe(25.0);
    });

    test('should round correctly', () => {
      const money = Money.create('1000', CurrencyCode.EUR);
      const result = money.multiply(1.333);

      expect(result.toNumber()).toBeCloseTo(13.33, 2);
    });
  });

  describe('isZero', () => {
    test('should return true for zero', () => {
      const zero = Money.zero(CurrencyCode.EUR);
      expect(zero.isZero()).toBe(true);
    });

    test('should return false for non-zero', () => {
      const money = Money.create('100', CurrencyCode.EUR);
      expect(money.isZero()).toBe(false);
    });
  });

  describe('isPositive', () => {
    test('should return true for positive amount', () => {
      const money = Money.create('1000', CurrencyCode.EUR);
      expect(money.isPositive()).toBe(true);
    });

    test('should return false for zero', () => {
      const zero = Money.zero(CurrencyCode.EUR);
      expect(zero.isPositive()).toBe(false);
    });

    test('should return false for negative', () => {
      const money = Money.fromNumber(-10, CurrencyCode.EUR);
      expect(money.isPositive()).toBe(false);
    });
  });

  describe('isNegative', () => {
    test('should return true for negative amount', () => {
      const money = Money.fromNumber(-10, CurrencyCode.EUR);
      expect(money.isNegative()).toBe(true);
    });

    test('should return false for positive', () => {
      const money = Money.create('1000', CurrencyCode.EUR);
      expect(money.isNegative()).toBe(false);
    });
  });

  describe('abs', () => {
    test('should return absolute value', () => {
      const negative = Money.fromNumber(-10, CurrencyCode.EUR);
      const abs = negative.abs();

      expect(abs.toNumber()).toBe(10);
      expect(abs.isPositive()).toBe(true);
    });

    test('should return same value for positive', () => {
      const positive = Money.create('1000', CurrencyCode.EUR);
      const abs = positive.abs();

      expect(abs.equals(positive)).toBe(true);
    });
  });

  describe('negate', () => {
    test('should negate positive value', () => {
      const money = Money.create('1000', CurrencyCode.EUR);
      const negated = money.negate();

      expect(negated.toNumber()).toBe(-10);
      expect(negated.isNegative()).toBe(true);
    });

    test('should negate negative value', () => {
      const money = Money.fromNumber(-10, CurrencyCode.EUR);
      const negated = money.negate();

      expect(negated.toNumber()).toBe(10);
      expect(negated.isPositive()).toBe(true);
    });
  });

  describe('equals', () => {
    test('should return true for equal values', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('1000', CurrencyCode.EUR);

      expect(a.equals(b)).toBe(true);
    });

    test('should return false for different amounts', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('2000', CurrencyCode.EUR);

      expect(a.equals(b)).toBe(false);
    });

    test('should return false for different currencies', () => {
      const a = Money.create('1000', CurrencyCode.EUR);
      const b = Money.create('1000', CurrencyCode.USD);

      expect(a.equals(b)).toBe(false);
    });
  });
});

