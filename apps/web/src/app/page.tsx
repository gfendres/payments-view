'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Coins, Tags, FileDown, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@payments-view/ui';

import { WalletButton, useAuth } from '@/features/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard immediately when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
      {/* Background grid lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Vertical lines */}
        <div className="absolute inset-0 flex justify-around">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="h-full w-px bg-gradient-to-b from-transparent via-border/30 to-transparent"
            />
          ))}
        </div>
        {/* Horizontal lines */}
        <div className="absolute inset-0 flex flex-col justify-around">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent"
            />
          ))}
        </div>
      </div>

      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Wallet className="h-10 w-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-primary">Gnosis Pay</span>{' '}
          <span className="text-foreground">Dashboard</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
          Track your card transactions, analyze spending patterns, and maximize your GNO cashback
          rewards — all in one beautiful dashboard.
        </p>

        {/* Connect button or Go to Dashboard */}
        <div className="mb-12">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">You&apos;re connected!</p>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <WalletButton variant="hero" />
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
          <FeatureCard
            icon={BarChart3}
            title="Analytics"
            description="Spending insights"
          />
          <FeatureCard
            icon={Coins}
            title="Cashback"
            description="Track rewards"
          />
          <FeatureCard
            icon={Tags}
            title="Categories"
            description="Smart sorting"
          />
          <FeatureCard
            icon={FileDown}
            title="Export"
            description="CSV & reports"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground">
        <p>Built for the Gnosis ecosystem</p>
      </footer>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-colors hover:bg-card/80">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
