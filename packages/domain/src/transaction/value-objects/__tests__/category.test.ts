import { describe, test, expect } from 'bun:test';
import { Category } from '../category';
import { CategoryId } from '@payments-view/constants';

describe('Category', () => {
  describe('fromId', () => {
    test('should create category from ID', () => {
      const category = Category.fromId(CategoryId.GROCERIES);

      expect(category.id).toBe(CategoryId.GROCERIES);
      expect(category.name).toBeTruthy();
      expect(category.icon).toBeTruthy();
      expect(category.color).toBeTruthy();
    });

    test('should create different categories', () => {
      const groceries = Category.fromId(CategoryId.GROCERIES);
      const dining = Category.fromId(CategoryId.DINING);

      expect(groceries.id).not.toBe(dining.id);
      expect(groceries.name).not.toBe(dining.name);
    });
  });

  describe('fromMcc', () => {
    test('should create category from MCC code', () => {
      const category = Category.fromMcc('5411'); // Groceries MCC

      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBeTruthy();
    });

    test('should handle unknown MCC codes', () => {
      const category = Category.fromMcc('9999'); // Unknown MCC

      expect(category).toBeInstanceOf(Category);
      // Should default to UNCATEGORIZED or similar
    });
  });

  describe('id', () => {
    test('should return category ID', () => {
      const category = Category.fromId(CategoryId.GROCERIES);

      expect(category.id).toBe(CategoryId.GROCERIES);
    });
  });

  describe('name', () => {
    test('should return display name', () => {
      const category = Category.fromId(CategoryId.GROCERIES);

      expect(typeof category.name).toBe('string');
      expect(category.name.length).toBeGreaterThan(0);
    });
  });

  describe('icon', () => {
    test('should return icon emoji', () => {
      const category = Category.fromId(CategoryId.GROCERIES);

      expect(typeof category.icon).toBe('string');
    });
  });

  describe('color', () => {
    test('should return color string', () => {
      const category = Category.fromId(CategoryId.GROCERIES);

      expect(typeof category.color).toBe('string');
    });
  });

  describe('equals', () => {
    test('should return true for same category', () => {
      const a = Category.fromId(CategoryId.GROCERIES);
      const b = Category.fromId(CategoryId.GROCERIES);

      expect(a.equals(b)).toBe(true);
    });

    test('should return false for different categories', () => {
      const a = Category.fromId(CategoryId.GROCERIES);
      const b = Category.fromId(CategoryId.DINING);

      expect(a.equals(b)).toBe(false);
    });
  });
});

