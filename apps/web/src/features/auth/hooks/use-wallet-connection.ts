'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useConnect } from 'wagmi';

import { getDeviceInfo, isMobileDevice } from '@/lib/utils/mobile';

/**
 * Hook for wallet connection logic with mobile support and error handling
 */
export function useWalletConnection() {
  const { isConnected, connector } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const connectionAttemptRef = useRef<number>(0);
  const lastErrorRef = useRef<Error | null>(null);

  // Log device info on mount for debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && isMobileDevice()) {
      const deviceInfo = getDeviceInfo();
      console.log('[Wallet Connection] Device info:', deviceInfo);
      console.log('[Wallet Connection] Available connectors:', connectors.map((c) => c.name));
    }
  }, [connectors]);

  // Track connection errors
  useEffect(() => {
    if (connectError) {
      lastErrorRef.current = connectError;
      const deviceInfo = getDeviceInfo();
      console.error('[Wallet Connection] Connection error:', {
        error: connectError.message,
        connector: connector?.name,
        deviceInfo,
        attempt: connectionAttemptRef.current,
      });
    }
  }, [connectError, connector]);

  /**
   * Connect to a wallet with error handling and retry logic
   */
  const connectWallet = useCallback(
    async (connectorId?: string) => {
      if (isConnected) {
        console.log('[Wallet Connection] Already connected');
        return;
      }

      connectionAttemptRef.current += 1;
      const deviceInfo = getDeviceInfo();

      console.log('[Wallet Connection] Attempting connection:', {
        connectorId,
        attempt: connectionAttemptRef.current,
        deviceInfo,
      });

      try {
        const targetConnector = connectorId
          ? connectors.find((c) => c.id === connectorId)
          : connectors[0];

        if (!targetConnector) {
          throw new Error(`Connector not found: ${connectorId || 'default'}`);
        }

        console.log('[Wallet Connection] Connecting to:', targetConnector.name);

        await connect({ connector: targetConnector });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Wallet Connection] Connection failed:', {
          error: errorMessage,
          connectorId,
          attempt: connectionAttemptRef.current,
          deviceInfo,
        });
        throw error;
      }
    },
    [connect, connectors, isConnected]
  );

  /**
   * Get connection error message
   */
  const getErrorMessage = useCallback((): string | null => {
    if (!connectError) {
      return null;
    }

    const baseMessage = connectError.message;

    // Add context for mobile-specific errors
    if (isMobileDevice()) {
      if (baseMessage.includes('User rejected')) {
        return 'Connection was cancelled. Please try again.';
      }
      if (baseMessage.includes('timeout') || baseMessage.includes('network')) {
        return 'Connection timed out. Please check your internet connection and try again.';
      }
      if (baseMessage.includes('deep link') || baseMessage.includes('app')) {
        return 'Could not open wallet app. Please make sure the wallet app is installed.';
      }
    }

    return baseMessage;
  }, [connectError]);

  return {
    isConnected,
    isConnecting: isPending,
    connector,
    connectors,
    error: connectError,
    errorMessage: getErrorMessage(),
    connectWallet,
    connectionAttempt: connectionAttemptRef.current,
  };
}

