/**
 * Category ID enum for transaction categorization
 */
export enum CategoryId {
  GROCERIES = 'groceries',
  DINING = 'dining',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  TRAVEL = 'travel',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  UTILITIES = 'utilities',
  DIGITAL = 'digital',
  ATM = 'atm',
  OTHER = 'other',
}

/**
 * Type guard to check if a value is a valid CategoryId
 */
export function isCategoryId(value: string): value is CategoryId {
  return Object.values(CategoryId).includes(value as CategoryId);
}

