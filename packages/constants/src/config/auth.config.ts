/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  /**
   * Buffer time before JWT expiry to trigger refresh (5 minutes)
   */
  JWT_EXPIRY_BUFFER_MS: 5 * 60 * 1000,

  /**
   * JWT time-to-live (1 hour)
   */
  JWT_TTL_MS: 60 * 60 * 1000,

  /**
   * Session storage key
   */
  SESSION_STORAGE_KEY: 'gnosis_session',

  /**
   * SIWE domain
   */
  SIWE_DOMAIN: 'payments-view.app',

  /**
   * SIWE URI
   */
  SIWE_URI: 'https://payments-view.app',

  /**
   * SIWE statement
   */
  SIWE_STATEMENT: 'Sign in with Ethereum to Gnosis Pay Portfolio Dashboard',

  /**
   * SIWE version
   */
  SIWE_VERSION: '1',

  /**
   * Chain ID for Gnosis Chain
   */
  CHAIN_ID: 100,
} as const;

