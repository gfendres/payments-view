'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Copy, Check } from 'lucide-react';
import { Button } from '@payments-view/ui';

import { useAuth } from '../hooks/use-auth';

interface WalletButtonProps {
  /** Variant for different contexts */
  variant?: 'default' | 'hero';
  /** Redirect to this path after successful authentication */
  redirectTo?: string;
}

/**
 * Wallet connection button with SIWE authentication
 */
export function WalletButton({ variant = 'default', redirectTo = '/dashboard' }: WalletButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isConnected, signIn, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const handleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  const handleCopy = useCallback(
    async (address: string) => {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // no-op
      }
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                    onClick={() => {
                      setIsConnecting(true);
                      openConnectModal();
                      // Clear loading state after modal opens
                      setTimeout(() => setIsConnecting(false), 1000);
                    }}
                    disabled={isConnecting}
                    variant="default"
                    size="lg"
                    className={
                      isHero
                        ? 'h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30'
                        : undefined
                    }
                  >
                    {isConnecting ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Opening...</span>
                      </>
                    ) : (
                      <>
                        {isHero ? <Wallet className="mr-2 h-5 w-5" /> : null}
                        Connect Wallet
                      </>
                    )}
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
                const signInButtonClass = isHero
                  ? 'h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30'
                  : 'h-11 w-full justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-none hover:bg-primary/15';

                return (
                  <Button
                    onClick={handleSignIn}
                    disabled={isLoading || !isConnected}
                    variant="default"
                    size={isHero ? 'lg' : 'default'}
                    className={signInButtonClass}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span>Sign in with Ethereum</span>
                      </>
                    )}
                  </Button>
                );
              }

              // Authenticated - show account info
              return (
                <div className="relative w-full" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                    type="button"
                    title={chain.name}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {chain.hasIcon && chain.iconUrl ? <Image
                          src={chain.iconUrl}
                          alt={chain.name ?? 'Chain icon'}
                          width={18}
                          height={18}
                          className="rounded-full"
                        /> : null}
                      <span className="truncate text-foreground">{chain.name}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {account.address.slice(0, 5)}
                    </span>
                  </button>

                  {menuOpen ? (
                    <div className="absolute left-0 mt-2 w-full min-w-[16rem] rounded-2xl border border-border bg-card p-3 shadow-xl">
                      <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
                        <span className="font-mono text-sm text-foreground truncate">
                          {formatAddress(account.address)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.address)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy address"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button
                        onClick={signOut}
                        variant="outline"
                        size="default"
                        className="mt-3 w-full justify-center"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : null}
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
