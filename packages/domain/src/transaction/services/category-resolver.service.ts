import {
  type CategoryId,
  getCategoryFromMcc,
  MCC_TO_CATEGORY,
} from '@payments-view/constants';

/**
 * Category resolver service
 * Provides MCC to category mapping and reverse lookup
 */
export class CategoryResolverService {
  private readonly categoryToMccMap: Map<CategoryId, string[]>;

  constructor() {
    this.categoryToMccMap = this.buildCategoryToMccMap();
  }

  /**
   * Build reverse mapping from category to MCC codes
   */
  private buildCategoryToMccMap(): Map<CategoryId, string[]> {
    const map = new Map<CategoryId, string[]>();

    for (const [mcc, categoryId] of Object.entries(MCC_TO_CATEGORY)) {
      const existing = map.get(categoryId) ?? [];
      existing.push(mcc);
      map.set(categoryId, existing);
    }

    return map;
  }

  /**
   * Get category ID from MCC code
   */
  resolveCategory(mcc: string): CategoryId {
    return getCategoryFromMcc(mcc);
  }

  /**
   * Get all MCC codes for a category
   */
  getMccCodesForCategory(categoryId: CategoryId): string[] {
    return this.categoryToMccMap.get(categoryId) ?? [];
  }

  /**
   * Get all MCC codes for multiple categories
   */
  getMccCodesForCategories(categoryIds: CategoryId[]): string[] {
    const mccCodes: string[] = [];
    for (const categoryId of categoryIds) {
      mccCodes.push(...this.getMccCodesForCategory(categoryId));
    }
    return mccCodes;
  }

  /**
   * Check if an MCC code belongs to any of the given categories
   */
  mccMatchesCategories(mcc: string, categoryIds: CategoryId[]): boolean {
    if (categoryIds.length === 0) return true;
    const resolvedCategory = this.resolveCategory(mcc);
    return categoryIds.includes(resolvedCategory);
  }
}

