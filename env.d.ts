/**
 * Type declarations for environment variables
 * This allows TypeScript to know about our custom env vars
 * and enables dot notation access with noPropertyAccessFromIndexSignature
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Node environment
    NODE_ENV: 'development' | 'production' | 'test';

    // Auth configuration
    AUTH_JWT_SECRET?: string;
    LOG_AUTH_DEBUG?: string;
    ENABLE_LOCAL_JWT_FALLBACK?: string;

    // Gnosis Pay API
    GNOSIS_PAY_API_URL?: string;
    GNOSIS_PAY_API_KEY?: string;

    // WalletConnect
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID?: string;

    // Server
    PORT?: string;
  }
}





