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
  isLoading: boolean;
  isConnected: boolean;
  walletAddress: string | undefined;
  token: string | null;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

/**
 * Storage keys
 */
const AUTH_TOKEN_KEY = 'gnosis_auth_token';
const AUTH_EXPIRY_KEY = 'gnosis_auth_expiry';
const AUTH_ADDRESS_KEY = 'gnosis_auth_address';

/**
 * Delay before clearing auth when wallet appears disconnected (ms)
 * This prevents race conditions during page navigation when wagmi hasn't reconnected yet
 */
const WALLET_DISCONNECT_GRACE_PERIOD_MS = 2000;

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Load auth from storage
 */
const loadFromStorage = () => {
  if (typeof window === 'undefined') {
    return { token: null, expiresAt: null, walletAddress: null };
  }

  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const expiryStr = sessionStorage.getItem(AUTH_EXPIRY_KEY);
  const walletAddress = sessionStorage.getItem(AUTH_ADDRESS_KEY);

  if (!token || !expiryStr) {
    return { token: null, expiresAt: null, walletAddress: null };
  }

  const expiresAt = new Date(expiryStr);

  // Check if expired
  if (expiresAt <= new Date()) {
    clearStorage();
    return { token: null, expiresAt: null, walletAddress: null };
  }

  return { token, expiresAt, walletAddress };
};

/**
 * Save auth to storage
 */
const saveToStorage = (token: string, expiresAt: string, walletAddress: string) => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_EXPIRY_KEY, expiresAt);
  sessionStorage.setItem(AUTH_ADDRESS_KEY, walletAddress);
};

/**
 * Clear auth from storage
 */
const clearStorage = () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_EXPIRY_KEY);
  sessionStorage.removeItem(AUTH_ADDRESS_KEY);
};

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component with token refresh
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSigningRef = useRef(false);
  const disconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC mutations
  const generateSiweMessage = trpc.auth.generateSiweMessage.useMutation();
  const authenticate = trpc.auth.authenticate.useMutation();

  // Load initial state from storage on hydration
  useEffect(() => {
    const stored = loadFromStorage();
    console.log('[Auth] Hydration - loaded from storage:', {
      hasToken: !!stored.token,
      hasExpiry: !!stored.expiresAt,
      walletAddress: stored.walletAddress,
    });
    if (stored.token && stored.expiresAt) {
      setToken(stored.token);
      setWalletAddress(stored.walletAddress);
      setExpiresAt(stored.expiresAt);
    }
    // Mark as hydrated after loading storage
    setHasHydrated(true);
  }, []);

  /**
   * Clear auth state
   */
  const clearAuth = useCallback(() => {
    setToken(null);
    setWalletAddress(null);
    setExpiresAt(null);
    clearStorage();
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  /**
   * Setup auto-refresh timer
   */
  const setupRefreshTimer = useCallback(
    (expiry: Date) => {
      // Clear existing timer
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Calculate refresh time (5 minutes before expiry)
      const refreshTime = expiry.getTime() - AUTH_CONFIG.JWT_EXPIRY_BUFFER_MS - Date.now();

      if (refreshTime <= 0) {
        // Token already needs refresh or is expired
        clearAuth();
        return;
      }

      // Set timer to clear auth before expiry
      // In a real app, this would trigger a token refresh
      // For now, we just clear auth and user needs to sign in again
      refreshTimeoutRef.current = setTimeout(() => {
        clearAuth();
      }, refreshTime);
    },
    [clearAuth]
  );

  // Setup refresh timer when expiresAt changes
  useEffect(() => {
    if (expiresAt) {
      setupRefreshTimer(expiresAt);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [expiresAt, setupRefreshTimer]);

  // Clear auth if wallet disconnects or address changes
  // Skip if we're in the middle of signing, reconnecting, connecting, or haven't hydrated yet
  useEffect(() => {
    // Clear any pending disconnect timeout
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }

    // Don't clear during initial hydration, while reconnecting, connecting, or signing
    if (!hasHydrated || isReconnecting || isConnecting || isSigningRef.current) {
      return;
    }

    if (!isConnected && token) {
      // Wallet appears disconnected but we have a token
      // Use a grace period to avoid race conditions during page navigation
      // where wagmi hasn't reconnected yet
      disconnectTimeoutRef.current = setTimeout(() => {
        // Double-check we still have a token and wallet is still disconnected
        const stored = loadFromStorage();
        if (stored.token) {
          clearAuth();
        }
      }, WALLET_DISCONNECT_GRACE_PERIOD_MS);
    } else if (
      address &&
      walletAddress &&
      address.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      // Address changed, clear auth immediately
      clearAuth();
    }

    return () => {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
        disconnectTimeoutRef.current = null;
      }
    };
  }, [isConnected, isConnecting, isReconnecting, hasHydrated, address, walletAddress, token, clearAuth]);

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

      // Authenticate
      const result = await authenticate.mutateAsync({
        address,
        message,
        signature,
      });

      // Save state
      const expiry = new Date(result.expiresAt);
      console.log('[Auth] Sign-in successful:', {
        token: result.token.substring(0, 20) + '...',
        expiresAt: result.expiresAt,
        walletAddress: result.walletAddress,
      });
      setToken(result.token);
      setWalletAddress(result.walletAddress);
      setExpiresAt(expiry);
      saveToStorage(result.token, result.expiresAt, result.walletAddress);
      setupRefreshTimer(expiry);

      console.log('[Auth] Token saved to sessionStorage, invalidating queries...');
      // Invalidate all queries to force refetch with new auth token
      await queryClient.invalidateQueries();
      console.log('[Auth] Queries invalidated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
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
    authenticate,
    setupRefreshTimer,
    queryClient,
  ]);

  /**
   * Sign out
   */
  const signOut = useCallback(() => {
    clearAuth();
    disconnect();
    // Clear all cached queries
    queryClient.clear();
  }, [clearAuth, disconnect, queryClient]);

  const isAuthenticated = !!token && !!expiresAt && expiresAt > new Date();

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('[Auth] State changed:', {
      isAuthenticated,
      hasToken: !!token,
      hasExpiry: !!expiresAt,
      isConnected,
      hasHydrated,
    });
  }, [isAuthenticated, token, expiresAt, isConnected, hasHydrated]);

  const value: AuthContextState = {
    isAuthenticated,
    isLoading,
    isConnected,
    walletAddress: address,
    token,
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

