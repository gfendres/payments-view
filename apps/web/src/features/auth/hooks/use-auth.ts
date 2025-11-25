'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { AUTH_CONFIG } from '@payments-view/constants';

import { trpc } from '@/lib/trpc';

/**
 * Auth state
 */
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
  walletAddress: string | null;
}

/**
 * Auth hook return type
 */
interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  isConnected: boolean;
  walletAddress: string | undefined;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

/**
 * Storage key for auth token
 */
const AUTH_TOKEN_KEY = 'gnosis_auth_token';
const AUTH_EXPIRY_KEY = 'gnosis_auth_expiry';
const AUTH_ADDRESS_KEY = 'gnosis_auth_address';

/**
 * Load auth state from session storage
 */
const loadAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, token: null, expiresAt: null, walletAddress: null };
  }

  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const expiryStr = sessionStorage.getItem(AUTH_EXPIRY_KEY);
  const walletAddress = sessionStorage.getItem(AUTH_ADDRESS_KEY);

  if (!token || !expiryStr) {
    return { isAuthenticated: false, token: null, expiresAt: null, walletAddress: null };
  }

  const expiresAt = new Date(expiryStr);

  // Check if token is expired
  if (expiresAt <= new Date()) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_EXPIRY_KEY);
    sessionStorage.removeItem(AUTH_ADDRESS_KEY);
    return { isAuthenticated: false, token: null, expiresAt: null, walletAddress: null };
  }

  return { isAuthenticated: true, token, expiresAt, walletAddress };
};

/**
 * Save auth state to session storage
 */
const saveAuthState = (token: string, expiresAt: string, walletAddress: string): void => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_EXPIRY_KEY, expiresAt);
  sessionStorage.setItem(AUTH_ADDRESS_KEY, walletAddress);
};

/**
 * Clear auth state from session storage
 */
const clearAuthState = (): void => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_EXPIRY_KEY);
  sessionStorage.removeItem(AUTH_ADDRESS_KEY);
};

/**
 * Authentication hook for SIWE flow
 */
export function useAuth(): UseAuthReturn {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    walletAddress: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations
  const generateSiweMessage = trpc.auth.generateSiweMessage.useMutation();
  const authenticate = trpc.auth.authenticate.useMutation();

  // Load initial auth state
  useEffect(() => {
    const state = loadAuthState();
    setAuthState(state);
  }, []);

  // Clear auth if wallet disconnects or address changes
  useEffect(() => {
    if (!isConnected) {
      setAuthState({
        isAuthenticated: false,
        token: null,
        expiresAt: null,
        walletAddress: null,
      });
      clearAuthState();
    } else if (
      address &&
      authState.walletAddress &&
      address.toLowerCase() !== authState.walletAddress.toLowerCase()
    ) {
      // Address changed, clear auth
      setAuthState({
        isAuthenticated: false,
        token: null,
        expiresAt: null,
        walletAddress: null,
      });
      clearAuthState();
    }
  }, [isConnected, address, authState.walletAddress]);

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

      // Sign message with wallet
      const signature = await signMessageAsync({ message });

      // Authenticate with backend
      const result = await authenticate.mutateAsync({
        address,
        message,
        signature,
      });

      // Save auth state
      saveAuthState(result.token, result.expiresAt, result.walletAddress);

      setAuthState({
        isAuthenticated: true,
        token: result.token,
        expiresAt: new Date(result.expiresAt),
        walletAddress: result.walletAddress,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, generateSiweMessage, signMessageAsync, authenticate]);

  /**
   * Sign out and disconnect wallet
   */
  const signOut = useCallback(() => {
    clearAuthState();
    setAuthState({
      isAuthenticated: false,
      token: null,
      expiresAt: null,
      walletAddress: null,
    });
    disconnect();
  }, [disconnect]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    isConnected,
    walletAddress: address,
    error,
    signIn,
    signOut,
  };
}

