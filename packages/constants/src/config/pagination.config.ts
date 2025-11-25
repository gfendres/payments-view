/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  /**
   * Default number of items per page
   */
  DEFAULT_PAGE_SIZE: 20,

  /**
   * Minimum allowed page size
   */
  MIN_PAGE_SIZE: 10,

  /**
   * Maximum allowed page size
   */
  MAX_PAGE_SIZE: 100,

  /**
   * Default items for API requests to Gnosis Pay
   */
  API_DEFAULT_LIMIT: 100,
} as const;

/**
 * Validate and constrain page size to allowed range
 */
export function constrainPageSize(size: number): number {
  return Math.max(
    PAGINATION_CONFIG.MIN_PAGE_SIZE,
    Math.min(PAGINATION_CONFIG.MAX_PAGE_SIZE, size)
  );
}

