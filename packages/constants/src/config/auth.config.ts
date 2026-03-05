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
   * SIWE domain (hostname registered with Gnosis Pay)
   */
  SIWE_DOMAIN: 'financedashboard.app',

  /**
   * SIWE URI (origin registered with Gnosis Pay, must include protocol)
   */
  SIWE_URI: 'https://financedashboard.app',

  /**
   * SIWE statement
   */
  SIWE_STATEMENT: 'Sign in with Ethereum to Finance Dashboard',

  /**
   * SIWE version
   */
  SIWE_VERSION: '1',

  /**
   * Chain ID for Gnosis Chain
   */
  CHAIN_ID: 100,

  /**
   * Environment variable name used for verifying JWT signatures
   */
  JWT_SIGNING_SECRET_ENV_KEY: 'AUTH_JWT_SECRET',
} as const;
