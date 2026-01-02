'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { httpBatchLink } from '@trpc/client';
import { TooltipProvider, ToastProvider, ErrorBoundary } from '@payments-view/ui';

import { wagmiConfig } from '@/lib/wagmi';
import { trpc } from '@/lib/trpc';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from './theme-provider';
import { isMobileDevice, getDeviceInfo } from '@/lib/utils/mobile';
import { setupSafariDeepLinkInterceptor } from '@/lib/utils/safari-deep-link';

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
 * Get mobile-optimized modal size
 * On mobile, use 'wide' for better wallet selection visibility
 */
function getModalSize(): 'compact' | 'wide' {
  if (typeof window === 'undefined') {
    return 'compact';
  }
  return isMobileDevice() ? 'wide' : 'compact';
}

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

  // Log device info in development for debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const deviceInfo = getDeviceInfo();
      console.log('[Providers] Device info:', deviceInfo);
    }
  }, []);

  // Setup Safari deep link interceptor ONLY for Safari simulator
  // Real devices (iPhone, Android) don't need interceptor - deep links work natively
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceInfo = getDeviceInfo();
      // Only setup interceptor for Safari simulator (macOS Safari simulating iOS)
      // Real iPhones don't need this - deep linking works natively
      if (deviceInfo.isSafariSimulator) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Providers] Setting up Safari deep link interceptor', deviceInfo);
          console.log('[Providers] User agent:', navigator.userAgent);
        }

        const cleanup = setupSafariDeepLinkInterceptor();

        return () => {
          cleanup();
        };
      }
    }
  }, []);

  const modalSize = getModalSize();

  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <TooltipProvider delayDuration={300}>
          <ErrorBoundary
            fallback={
              <div className="flex min-h-screen items-center justify-center p-4">
                <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
                  <h2 className="text-destructive mb-2 text-lg font-semibold">
                    Wallet Connection Error
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    An error occurred while connecting your wallet. Please refresh the page and try
                    again.
                  </p>
                </div>
              </div>
            }
          >
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                  <RainbowKitProvider theme={customTheme} modalSize={modalSize}>
                    <AuthProvider>{children}</AuthProvider>
                  </RainbowKitProvider>
                </WagmiProvider>
              </QueryClientProvider>
            </trpc.Provider>
          </ErrorBoundary>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
