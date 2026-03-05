'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_CONFIG } from '@payments-view/constants';

import { trpc } from '@/lib/trpc';

/**
 * Auth context state
 */
interface AuthContextState {
  isAuthenticated: boolean;
  isSessionResolved: boolean;
  isLoading: boolean;
  isConnected: boolean;
  walletAddress: string | undefined;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

/**
 * Session response payload
 */
interface SessionResponse {
  authenticated: boolean;
  walletAddress?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Throttle session checks triggered by visibility changes (ms)
 */
const SESSION_REVALIDATION_THROTTLE_MS = 1500;

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Extract meaningful error from failed HTTP calls
 */
const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      return payload.error;
    }
  } catch {
    // no-op
  }

  return 'Authentication request failed';
};

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component backed by server-side cookie sessions
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const [authenticatedWalletAddress, setAuthenticatedWalletAddress] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionResolved, setIsSessionResolved] = useState(false);

  const revalidateInFlightRef = useRef<Promise<void> | null>(null);
  const lastRevalidationAtRef = useRef(0);
  const isSigningRef = useRef(false);
  const isHandlingMismatchRef = useRef(false);

  // tRPC mutation for SIWE message generation
  const generateSiweMessage = trpc.auth.generateSiweMessage.useMutation();

  const clearAuthState = useCallback(() => {
    setAuthenticatedWalletAddress(null);
    setExpiresAt(null);
  }, []);

  const applySession = useCallback(
    (payload: SessionResponse) => {
      if (!payload.authenticated || !payload.walletAddress || !payload.expiresAt) {
        clearAuthState();
        return;
      }

      const parsedExpiry = new Date(payload.expiresAt);
      if (Number.isNaN(parsedExpiry.getTime()) || parsedExpiry <= new Date()) {
        clearAuthState();
        return;
      }

      setAuthenticatedWalletAddress(payload.walletAddress);
      setExpiresAt(parsedExpiry);
    },
    [clearAuthState]
  );

  const revalidateSession = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const now = Date.now();
      if (!force && now - lastRevalidationAtRef.current < SESSION_REVALIDATION_THROTTLE_MS) {
        return;
      }

      if (revalidateInFlightRef.current) {
        await revalidateInFlightRef.current;
        return;
      }

      lastRevalidationAtRef.current = now;

      const task = (async () => {
        try {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
          });

          if (!response.ok) {
            throw new Error(await getErrorMessage(response));
          }

          const payload = (await response.json()) as SessionResponse;
          applySession(payload);
        } catch {
          // Preserve in-memory session on transient network failures.
        } finally {
          setIsSessionResolved(true);
        }
      })();

      revalidateInFlightRef.current = task;
      try {
        await task;
      } finally {
        revalidateInFlightRef.current = null;
      }
    },
    [applySession]
  );

  // Load initial session from secure cookies
  useEffect(() => {
    void revalidateSession({ force: true });
  }, [revalidateSession]);

  // Revalidate session when app regains visibility after wallet app round-trips
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void revalidateSession();
      }
    };

    const handlePageShow = () => {
      void revalidateSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [revalidateSession]);

  // Proactively refresh in-memory session when expiry is reached
  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const msUntilExpiry = expiresAt.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      clearAuthState();
      return;
    }

    const timeoutId = setTimeout(() => {
      void revalidateSession({ force: true });
    }, msUntilExpiry + 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [expiresAt, clearAuthState, revalidateSession]);

  // If a different wallet connects while a session exists, invalidate server cookie and reset client auth.
  useEffect(() => {
    if (
      !isSessionResolved ||
      !authenticatedWalletAddress ||
      !address ||
      !isConnected ||
      isConnecting ||
      isReconnecting ||
      isSigningRef.current
    ) {
      return;
    }

    if (address.toLowerCase() === authenticatedWalletAddress.toLowerCase()) {
      return;
    }
    if (isHandlingMismatchRef.current) {
      return;
    }

    const invalidateSessionForMismatch = async () => {
      isHandlingMismatchRef.current = true;
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } finally {
        clearAuthState();
        disconnect();
        queryClient.clear();
        setError('Connected wallet changed. Please sign in again.');
        isHandlingMismatchRef.current = false;
      }
    };

    void invalidateSessionForMismatch();
  }, [
    isSessionResolved,
    authenticatedWalletAddress,
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    disconnect,
    queryClient,
    clearAuthState,
  ]);

  /**
   * Sign in with SIWE
   */
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    isSigningRef.current = true;

    try {
      // Generate SIWE message
      const { message } = await generateSiweMessage.mutateAsync({
        address,
        chainId: AUTH_CONFIG.CHAIN_ID,
      });

      // Sign message
      const signature = await signMessageAsync({ message });

      // Submit SIWE challenge via secure cookie auth endpoint
      const response = await fetch('/api/auth/siwe', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const sessionPayload = (await response.json()) as {
        walletAddress: string;
        expiresAt: string;
      };
      applySession({
        authenticated: true,
        walletAddress: sessionPayload.walletAddress,
        expiresAt: sessionPayload.expiresAt,
      });
      setIsSessionResolved(true);

      // Invalidate queries so protected data refetches with the new server session
      await queryClient.invalidateQueries();
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      const isUserRejection =
        /user rejected|denied|cancelled/i.test(raw);
      const errorMessage = isUserRejection
        ? 'Signature request was rejected.'
        : raw || 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      isSigningRef.current = false;
      setIsLoading(false);
    }
  }, [
    address,
    isConnected,
    generateSiweMessage,
    signMessageAsync,
    applySession,
    queryClient,
  ]);

  /**
   * Sign out
   */
  const signOut = useCallback(() => {
    setError(null);
    setIsLoading(true);

    const clearSession = async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } finally {
        clearAuthState();
        disconnect();
        queryClient.clear();
        setIsSessionResolved(true);
        setIsLoading(false);
      }
    };

    void clearSession();
  }, [clearAuthState, disconnect, queryClient]);

  const isAuthenticated =
    !!authenticatedWalletAddress && !!expiresAt && expiresAt > new Date();

  const value: AuthContextState = {
    isAuthenticated,
    isSessionResolved,
    isLoading,
    isConnected,
    walletAddress: address,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuthContext(): AuthContextState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
