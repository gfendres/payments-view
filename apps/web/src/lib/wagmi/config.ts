'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { gnosis } from 'wagmi/chains';

/**
 * WalletConnect project ID - should be set in environment
 * Get yours at https://cloud.walletconnect.com/
 */
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Log warning in development if project ID is not set
if (!WALLET_CONNECT_PROJECT_ID && typeof window !== 'undefined') {
  console.warn(
    '[Gnosis Pay] WalletConnect project ID not configured. ' +
    'Get one at https://cloud.walletconnect.com/ and set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env.local'
  );
}

/**
 * Wagmi configuration with RainbowKit defaults
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Gnosis Pay Portfolio',
  projectId: WALLET_CONNECT_PROJECT_ID || 'placeholder-id',
  chains: [gnosis],
  ssr: true,
});

