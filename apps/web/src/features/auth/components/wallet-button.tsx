'use client';

import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import { Button } from '@payments-view/ui';

import { useAuth } from '../hooks/use-auth';

interface WalletButtonProps {
  /** Variant for different contexts */
  variant?: 'default' | 'hero';
}

/**
 * Wallet connection button with SIWE authentication
 */
export function WalletButton({ variant = 'default' }: WalletButtonProps) {
  const { isAuthenticated, isLoading, isConnected, signIn, signOut } = useAuth();

  const isHero = variant === 'hero';

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              // Not connected - show connect button
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="default"
                    size="lg"
                    className={
                      isHero
                        ? 'h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30'
                        : undefined
                    }
                  >
                    {isHero && <Wallet className="mr-2 h-5 w-5" />}
                    Connect Wallet
                  </Button>
                );
              }

              // Wrong chain - show switch chain
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size={isHero ? 'lg' : 'default'}
                    className={
                      isHero
                        ? 'h-14 px-8 text-base font-semibold'
                        : undefined
                    }
                  >
                    Wrong Network
                  </Button>
                );
              }

              // Connected but not authenticated - show sign in
              if (!isAuthenticated) {
                return (
                  <Button
                    onClick={signIn}
                    disabled={isLoading || !isConnected}
                    variant="default"
                    size="lg"
                    className={
                      isHero
                        ? 'h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30'
                        : undefined
                    }
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Signing in...</span>
                      </>
                    ) : (
                      <>
                        {isHero && <Wallet className="mr-2 h-5 w-5" />}
                        Sign in with Ethereum
                      </>
                    )}
                  </Button>
                );
              }

              // Authenticated - show account info
              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                    type="button"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <Image
                        src={chain.iconUrl}
                        alt={chain.name ?? 'Chain icon'}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    )}
                    {chain.name}
                  </button>
                  <Button onClick={signOut} variant="outline" size="default">
                    {formatAddress(account.address)}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

/**
 * Format address to abbreviated form
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
