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
import { useAccount, useSignMessage, useDisconnect, useSwitchChain } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_CONFIG } from '@payments-view/constants';

import { trpc } from '@/lib/trpc';

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

interface SessionResponse {
  authenticated: boolean;
  walletAddress?: string;
  expiresAt?: string;
  error?: string;
}

const SESSION_REVALIDATION_THROTTLE_MS = 1500;

const AuthContext = createContext<AuthContextState | undefined>(undefined);

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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
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

  useEffect(() => {
    void revalidateSession({ force: true });
  }, [revalidateSession]);

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

  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    isSigningRef.current = true;

    try {
      if (chainId !== AUTH_CONFIG.CHAIN_ID) {
        await switchChainAsync({ chainId: AUTH_CONFIG.CHAIN_ID });
      }

      const { message, siweCookie } = await generateSiweMessage.mutateAsync({
        address,
        chainId: AUTH_CONFIG.CHAIN_ID,
      });

      const signature = await signMessageAsync({ message });

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
          siweCookie,
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

      await queryClient.invalidateQueries();
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      const isUserRejection = /user rejected|denied|cancelled/i.test(raw);
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
    chainId,
    isConnected,
    generateSiweMessage,
    signMessageAsync,
    switchChainAsync,
    applySession,
    queryClient,
  ]);

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

export function useAuthContext(): AuthContextState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
