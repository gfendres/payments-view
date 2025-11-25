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
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [token, setToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC mutations
  const generateSiweMessage = trpc.auth.generateSiweMessage.useMutation();
  const authenticate = trpc.auth.authenticate.useMutation();

  // Load initial state
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.token && stored.expiresAt) {
      setToken(stored.token);
      setWalletAddress(stored.walletAddress);
      setExpiresAt(stored.expiresAt);
    }
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
  useEffect(() => {
    if (!isConnected) {
      clearAuth();
    } else if (address && walletAddress && address.toLowerCase() !== walletAddress.toLowerCase()) {
      clearAuth();
    }
  }, [isConnected, address, walletAddress, clearAuth]);

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
      setToken(result.token);
      setWalletAddress(result.walletAddress);
      setExpiresAt(expiry);
      saveToStorage(result.token, result.expiresAt, result.walletAddress);
      setupRefreshTimer(expiry);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    isConnected,
    generateSiweMessage,
    signMessageAsync,
    authenticate,
    setupRefreshTimer,
  ]);

  /**
   * Sign out
   */
  const signOut = useCallback(() => {
    clearAuth();
    disconnect();
  }, [clearAuth, disconnect]);

  const isAuthenticated = !!token && !!expiresAt && expiresAt > new Date();

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

