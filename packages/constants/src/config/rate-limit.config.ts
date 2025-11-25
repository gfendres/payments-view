/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Time window for rate limiting (1 minute)
   */
  WINDOW_MS: 60 * 1000,

  /**
   * Maximum requests per window
   */
  MAX_REQUESTS_PER_WINDOW: 100,

  /**
   * Maximum requests per window for AI endpoints
   */
  MAX_AI_REQUESTS_PER_WINDOW: 10,
} as const;

