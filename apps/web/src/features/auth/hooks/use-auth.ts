'use client';

import { useAuthContext } from '../context/auth-context';

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
 * Authentication hook for SIWE flow
 * This is a convenience wrapper around useAuthContext
 */
export function useAuth(): UseAuthReturn {
  const context = useAuthContext();

  return {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    isConnected: context.isConnected,
    walletAddress: context.walletAddress,
    error: context.error,
    signIn: context.signIn,
    signOut: context.signOut,
  };
}

