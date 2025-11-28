/**
 * Gnosis Pay API configuration
 */
export const API_CONFIG = {
  GNOSIS_PAY: {
    BASE_URL: 'https://api.gnosispay.com',
    VERSION: 'v1',
    ENDPOINTS: {
      AUTH_NONCE: '/api/v1/auth/nonce',
      AUTH_CHALLENGE: '/api/v1/auth/challenge',
      TRANSACTIONS: '/api/v1/cards/transactions',
      REWARDS: '/api/v1/rewards',
    },
  },
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com',
    VERSION: 'v3',
    ENDPOINTS: {
      SIMPLE_PRICE: '/api/v3/simple/price',
    },
    /**
     * CoinGecko token IDs
     */
    TOKEN_IDS: {
      GNOSIS: 'gnosis',
    },
  },
} as const;

/**
 * Default request timeout in milliseconds
 */
export const REQUEST_TIMEOUT_MS = 30000;

/**
 * Maximum retry attempts for failed requests
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retries in milliseconds
 */
export const RETRY_DELAY_MS = 1000;

