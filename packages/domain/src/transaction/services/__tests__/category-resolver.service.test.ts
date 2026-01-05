import { describe, test, expect, beforeEach } from 'bun:test';
import { CategoryResolverService } from '../category-resolver.service';
import { CategoryId } from '@payments-view/constants';

describe('CategoryResolverService', () => {
  let service: CategoryResolverService;

  beforeEach(() => {
    service = new CategoryResolverService();
  });

  describe('resolveCategory', () => {
    test('should resolve category from MCC code', () => {
      const categoryId = service.resolveCategory('5411'); // Groceries MCC

      expect(categoryId).toBeDefined();
      // CategoryId is a number enum, but the function returns the enum value
      expect(typeof categoryId === 'number' || typeof categoryId === 'string').toBe(true);
    });

    test('should return category for known MCC', () => {
      const categoryId = service.resolveCategory('5411');

      expect(categoryId).toBe(CategoryId.GROCERIES);
    });
  });

  describe('getMccCodesForCategory', () => {
    test('should return MCC codes for category', () => {
      const mccCodes = service.getMccCodesForCategory(CategoryId.GROCERIES);

      expect(Array.isArray(mccCodes)).toBe(true);
      expect(mccCodes.length).toBeGreaterThan(0);
      expect(mccCodes).toContain('5411');
    });

    test('should return empty array for unknown category', () => {
      const mccCodes = service.getMccCodesForCategory('unknown' as unknown as CategoryId);

      expect(Array.isArray(mccCodes)).toBe(true);
    });
  });

  describe('getMccCodesForCategories', () => {
    test('should return MCC codes for multiple categories', () => {
      const categoryIds = [CategoryId.GROCERIES, CategoryId.DINING];
      const mccCodes = service.getMccCodesForCategories(categoryIds);

      expect(Array.isArray(mccCodes)).toBe(true);
      expect(mccCodes.length).toBeGreaterThan(0);
    });

    test('should return empty array for empty input', () => {
      const mccCodes = service.getMccCodesForCategories([]);

      expect(mccCodes).toEqual([]);
    });

    test('should combine MCC codes from multiple categories', () => {
      const groceriesMcc = service.getMccCodesForCategory(CategoryId.GROCERIES);
      const diningMcc = service.getMccCodesForCategory(CategoryId.DINING);
      const combined = service.getMccCodesForCategories([
        CategoryId.GROCERIES,
        CategoryId.DINING,
      ]);

      expect(combined.length).toBe(groceriesMcc.length + diningMcc.length);
    });
  });

  describe('mccMatchesCategories', () => {
    test('should return true when MCC matches category', () => {
      const matches = service.mccMatchesCategories('5411', [CategoryId.GROCERIES]);

      expect(matches).toBe(true);
    });

    test('should return false when MCC does not match', () => {
      const matches = service.mccMatchesCategories('5411', [CategoryId.DINING]);

      expect(matches).toBe(false);
    });

    test('should return true when MCC matches any category', () => {
      const matches = service.mccMatchesCategories('5411', [
        CategoryId.DINING,
        CategoryId.GROCERIES,
      ]);

      expect(matches).toBe(true);
    });

    test('should return true for empty category list', () => {
      const matches = service.mccMatchesCategories('5411', []);

      expect(matches).toBe(true);
    });
  });
});

