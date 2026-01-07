/**
 * Formatting and encoding configuration constants
 */
export const FORMAT_CONFIG = {
  /**
   * UUID and ID generation
   */
  UUID: {
    /**
     * Radix for base-36 string conversion (0-9a-z)
     */
    BASE36_RADIX: 36 as const,
    /**
     * Random ID substring start position (after '0.')
     */
    ID_SLICE_START: 2 as const,
    /**
     * Random ID substring end position (9 characters)
     */
    ID_SLICE_END: 9 as const,
  },

  /**
   * Time conversion constants
   */
  TIME: {
    /**
     * Milliseconds per second
     */
    MS_PER_SECOND: 1000,
  },

  /**
   * Cryptographic constants
   */
  CRYPTO: {
    /**
     * Default nonce byte length
     */
    NONCE_BYTES: 16,
  },

  /**
   * String length limits
   */
  STRING_LIMITS: {
    /**
     * Maximum error message length
     */
    MAX_ERROR_MESSAGE: 500,
  },

  /**
   * Percentage constants
   */
  PERCENTAGE: {
    /**
     * Full percentage (100%)
     */
    FULL: 100,
  },

  /**
   * Decimal precision
   */
  DECIMAL: {
    /**
     * Standard decimal places for financial calculations
     */
    PLACES: 10,
  },

  /**
   * String manipulation
   */
  STRING: {
    /**
     * Last 4 characters offset
     */
    LAST_FOUR_OFFSET: -4,
  },
} as const;

