'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Copy, Check } from 'lucide-react';
import { Button } from '@payments-view/ui';

import { useAuth } from '../hooks/use-auth';
import { useToast } from '@payments-view/ui';
import { isMobileDevice, getDeviceInfo, isSafariSimulator } from '@/lib/utils/mobile';

interface WalletButtonProps {
  /** Variant for different contexts */
  variant?: 'default' | 'hero';
  /** Redirect to this path after successful authentication */
  redirectTo?: string;
}

/**
 * Wallet connection button with SIWE authentication
 */
export function WalletButton({
  variant = 'default',
  redirectTo = '/dashboard',
}: WalletButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isConnected, signIn, signOut } = useAuth();
  const { error: showError } = useToast();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const hasShownSafariWarningRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const handleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  const handleCopy = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  }, []);

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

  /**
   * Handle wallet connection with error handling and mobile support
   */
  const handleConnect = useCallback(
    (openConnectModal: () => void) => {
      try {
        if (process.env.NODE_ENV === 'development') {
          const deviceInfo = getDeviceInfo();
          console.log('[WalletButton] Opening connect modal:', deviceInfo);
        }

        // Log Safari simulator warning (only once per session)
        if (isSafariSimulator() && !hasShownSafariWarningRef.current) {
          console.warn(
            '[WalletButton] Safari simulator detected. Deep links are not supported. ' +
              'Please use the WalletConnect option (blue icon) to scan QR code with your phone.'
          );
          hasShownSafariWarningRef.current = true;
          // Show helpful info message (not error, since QR code still works)
          showError(
            'Testing in Safari Simulator?',
            'Click the "WalletConnect" option (blue wallet icon) and scan the QR code with your phone. Individual wallet buttons (Rainbow, MetaMask) only work on real devices.'
          );
        }

        setIsOpeningModal(true);

        // Add small delay on mobile to ensure modal opens properly
        if (isMobileDevice()) {
          setTimeout(() => {
            openConnectModal();
            setIsOpeningModal(false);
          }, 100);
        } else {
          openConnectModal();
          setIsOpeningModal(false);
        }
      } catch (error) {
        setIsOpeningModal(false);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to open wallet connection';
        console.error('[WalletButton] Error opening connect modal:', error);

        // Provide helpful message for Safari simulator
        if (isSafariSimulator()) {
          showError(
            'Connection Error',
            'Safari simulator does not support deep links. Please use the QR code option in the wallet connection modal.'
          );
        } else {
          showError('Connection Error', errorMessage);
        }
      }
    },
    [showError]
  );

  /**
   * Handle touch events for mobile (fallback if onClick doesn't work)
   */
  const handleTouchStart = useCallback(
    (openConnectModal: () => void) => (e: React.TouchEvent) => {
      if (isMobileDevice()) {
        e.preventDefault();
        handleConnect(openConnectModal);
      }
    },
    [handleConnect]
  );

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
                    ref={buttonRef}
                    onClick={() => handleConnect(openConnectModal)}
                    onTouchStart={handleTouchStart(openConnectModal)}
                    disabled={isOpeningModal}
                    variant="default"
                    size="lg"
                    className={
                      isHero
                        ? 'shadow-primary/25 hover:shadow-primary/30 h-14 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl'
                        : undefined
                    }
                  >
                    {isHero && <Wallet className="mr-2 h-5 w-5" />}
                    {isOpeningModal ? 'Opening...' : 'Connect Wallet'}
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
                    className={isHero ? 'h-14 px-8 text-base font-semibold' : undefined}
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
                    className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors"
                    type="button"
                    title={chain.name}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {chain.hasIcon && chain.iconUrl && (
                        <Image
                          src={chain.iconUrl}
                          alt={chain.name ?? 'Chain icon'}
                          width={18}
                          height={18}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-foreground truncate">{chain.name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {account.address.slice(0, 5)}
                    </span>
                  </button>

                  {menuOpen ? (
                    <div className="border-border bg-card absolute left-0 mt-2 w-full min-w-[16rem] rounded-2xl border p-3 shadow-xl">
                      <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-xl px-3 py-2">
                        <span className="text-foreground truncate font-mono text-sm">
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
