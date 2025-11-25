'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { gnosis } from 'wagmi/chains';

/**
 * WalletConnect project ID - should be set in environment
 */
const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'development';

/**
 * Wagmi configuration with RainbowKit defaults
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Gnosis Pay Portfolio',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [gnosis],
  ssr: true,
});

