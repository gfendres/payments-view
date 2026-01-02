'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { httpBatchLink } from '@trpc/client';
import { TooltipProvider, ToastProvider } from '@payments-view/ui';

import { wagmiConfig } from '@/lib/wagmi';
import { trpc } from '@/lib/trpc';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from './theme-provider';

import '@rainbow-me/rainbowkit/styles.css';

export { ThemeProvider, useTheme } from './theme-provider';
export { ToastProvider, useToast } from '@payments-view/ui';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Custom RainbowKit theme matching our design system
 */
const customTheme = darkTheme({
  accentColor: '#10b981',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

/**
 * Get base URL for API
 */
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

/**
 * Combined providers wrapper with correct nesting order
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            if (typeof window !== 'undefined') {
              const token = sessionStorage.getItem('gnosis_auth_token');
              if (token) {
                return { Authorization: `Bearer ${token}` };
              }
            }
            return {};
          },
        }),
      ],
    })
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <TooltipProvider delayDuration={300}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <RainbowKitProvider theme={customTheme} modalSize="compact">
                  <AuthProvider>{children}</AuthProvider>
                </RainbowKitProvider>
              </WagmiProvider>
            </QueryClientProvider>
          </trpc.Provider>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
