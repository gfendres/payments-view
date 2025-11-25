'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletButton, useAuthContext } from '@/features/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="bg-primary text-primary-foreground shadow-primary/20 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold shadow-lg">
            G
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-primary">Gnosis Pay</span>{' '}
          <span className="text-foreground">Dashboard</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mx-auto mb-8 max-w-lg text-lg">
          Track your card transactions, analyze spending patterns, and maximize your GNO cashback
          rewards — all in one beautiful dashboard.
        </p>

        {/* Connect button */}
        <div className="mb-12">
          <WalletButton />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
          <div className="border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm">
            <div className="mb-2 text-2xl">📊</div>
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-muted-foreground text-xs">Spending insights</p>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm">
            <div className="mb-2 text-2xl">💰</div>
            <p className="text-sm font-medium">Cashback</p>
            <p className="text-muted-foreground text-xs">Track rewards</p>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm">
            <div className="mb-2 text-2xl">🏷️</div>
            <p className="text-sm font-medium">Categories</p>
            <p className="text-muted-foreground text-xs">Smart sorting</p>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm">
            <div className="mb-2 text-2xl">📤</div>
            <p className="text-sm font-medium">Export</p>
            <p className="text-muted-foreground text-xs">CSV & reports</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-muted-foreground absolute bottom-6 text-center text-sm">
        <p>Built for the Gnosis ecosystem • Sign in with Ethereum</p>
      </footer>
    </main>
  );
}
