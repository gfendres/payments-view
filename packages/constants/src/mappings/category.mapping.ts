import { CategoryId } from '../enums/category-id.enum';

/**
 * Category configuration with display information
 */
export interface CategoryConfig {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

/**
 * Category configuration lookup
 */
export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  [CategoryId.GROCERIES]: {
    id: CategoryId.GROCERIES,
    name: 'Groceries',
    icon: '🛒',
    color: '#22c55e',
  },
  [CategoryId.DINING]: {
    id: CategoryId.DINING,
    name: 'Dining',
    icon: '🍽️',
    color: '#f97316',
  },
  [CategoryId.TRANSPORT]: {
    id: CategoryId.TRANSPORT,
    name: 'Transport',
    icon: '🚗',
    color: '#3b82f6',
  },
  [CategoryId.SHOPPING]: {
    id: CategoryId.SHOPPING,
    name: 'Shopping',
    icon: '🛍️',
    color: '#a855f7',
  },
  [CategoryId.TRAVEL]: {
    id: CategoryId.TRAVEL,
    name: 'Travel',
    icon: '✈️',
    color: '#06b6d4',
  },
  [CategoryId.ENTERTAINMENT]: {
    id: CategoryId.ENTERTAINMENT,
    name: 'Entertainment',
    icon: '🎬',
    color: '#ec4899',
  },
  [CategoryId.HEALTH]: {
    id: CategoryId.HEALTH,
    name: 'Health',
    icon: '💊',
    color: '#14b8a6',
  },
  [CategoryId.UTILITIES]: {
    id: CategoryId.UTILITIES,
    name: 'Utilities',
    icon: '💡',
    color: '#64748b',
  },
  [CategoryId.DIGITAL]: {
    id: CategoryId.DIGITAL,
    name: 'Digital',
    icon: '📲',
    color: '#8b5cf6',
  },
  [CategoryId.ATM]: {
    id: CategoryId.ATM,
    name: 'ATM',
    icon: '🏧',
    color: '#eab308',
  },
  [CategoryId.OTHER]: {
    id: CategoryId.OTHER,
    name: 'Other',
    icon: '📦',
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

