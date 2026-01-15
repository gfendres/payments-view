'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { gnosis } from 'wagmi/chains';

/**
 * WalletConnect project ID - should be set in environment
 * Get yours at https://cloud.walletconnect.com/
 */
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

/**
 * Validate WalletConnect project ID format
 * Project IDs are typically 32-character hex strings
 */
function isValidProjectId(projectId: string | undefined): boolean {
  if (!projectId) {
    return false;
  }
  // WalletConnect project IDs are typically alphanumeric strings
  // Allow any non-empty string that's not the placeholder
  return projectId !== 'placeholder-id' && projectId.length > 0;
}

// Validate project ID in production
if (typeof window !== 'undefined') {
  const isProduction = process.env.NODE_ENV === 'production';
  const isValid = isValidProjectId(WALLET_CONNECT_PROJECT_ID);

  if (!isValid) {
    const message =
      '[Finance Dashboard] WalletConnect project ID not configured. ' +
      'Get one at https://cloud.walletconnect.com/ and set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env.local';

    if (isProduction) {
      console.error(message);
      // In production, fail fast if project ID is invalid
      throw new Error('WalletConnect project ID is required in production');
    } else {
      console.warn(message);
    }
  } else {
    // Log successful configuration in development
    if (!isProduction) {
      console.log('[Finance Dashboard] WalletConnect project ID configured');
    }
  }
}

/**
 * Wagmi configuration with RainbowKit defaults
 *
 * Default wallets included by getDefaultConfig:
 * - Rainbow Wallet (WalletConnect)
 * - MetaMask (WalletConnect + injected provider on desktop)
 * - Coinbase Wallet (WalletConnect)
 * - WalletConnect (generic QR code)
 * - Other default wallets
 *
 * On mobile:
 * - Injected providers (MetaMask extension) are automatically hidden
 * - All wallets use WalletConnect deep linking or QR code fallback
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Finance Dashboard',
  projectId: WALLET_CONNECT_PROJECT_ID || 'placeholder-id',
  chains: [gnosis],
  ssr: true,
});

// Log available connectors in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // This will be logged after wagmi initializes
  setTimeout(() => {
    console.log('[Finance Dashboard] Wagmi config initialized');
  }, 100);
}
