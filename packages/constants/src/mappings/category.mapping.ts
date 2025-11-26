import { CategoryId } from '../enums/category-id.enum';

/**
 * Icon names that map to Lucide icons
 */
export type CategoryIconName =
  | 'shopping-cart'
  | 'utensils'
  | 'car'
  | 'shopping-bag'
  | 'plane'
  | 'film'
  | 'heart-pulse'
  | 'lightbulb'
  | 'smartphone'
  | 'landmark'
  | 'package';

/**
 * Category configuration with display information
 */
export interface CategoryConfig {
  id: CategoryId;
  name: string;
  icon: CategoryIconName;
  color: string;
}

/**
 * Category configuration lookup
 */
export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  [CategoryId.GROCERIES]: {
    id: CategoryId.GROCERIES,
    name: 'Groceries',
    icon: 'shopping-cart',
    color: '#22c55e',
  },
  [CategoryId.DINING]: {
    id: CategoryId.DINING,
    name: 'Dining',
    icon: 'utensils',
    color: '#f97316',
  },
  [CategoryId.TRANSPORT]: {
    id: CategoryId.TRANSPORT,
    name: 'Transport',
    icon: 'car',
    color: '#3b82f6',
  },
  [CategoryId.SHOPPING]: {
    id: CategoryId.SHOPPING,
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#a855f7',
  },
  [CategoryId.TRAVEL]: {
    id: CategoryId.TRAVEL,
    name: 'Travel',
    icon: 'plane',
    color: '#06b6d4',
  },
  [CategoryId.ENTERTAINMENT]: {
    id: CategoryId.ENTERTAINMENT,
    name: 'Entertainment',
    icon: 'film',
    color: '#ec4899',
  },
  [CategoryId.HEALTH]: {
    id: CategoryId.HEALTH,
    name: 'Health',
    icon: 'heart-pulse',
    color: '#14b8a6',
  },
  [CategoryId.UTILITIES]: {
    id: CategoryId.UTILITIES,
    name: 'Utilities',
    icon: 'lightbulb',
    color: '#64748b',
  },
  [CategoryId.DIGITAL]: {
    id: CategoryId.DIGITAL,
    name: 'Digital',
    icon: 'smartphone',
    color: '#8b5cf6',
  },
  [CategoryId.ATM]: {
    id: CategoryId.ATM,
    name: 'ATM',
    icon: 'landmark',
    color: '#eab308',
  },
  [CategoryId.OTHER]: {
    id: CategoryId.OTHER,
    name: 'Other',
    icon: 'package',
    color: '#94a3b8',
  },
};

/**
 * Get category config by ID
 */
export function getCategoryConfig(id: CategoryId): CategoryConfig {
  return CATEGORIES[id];
}

/**
 * Get all categories as an array
 */
export function getAllCategories(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}

