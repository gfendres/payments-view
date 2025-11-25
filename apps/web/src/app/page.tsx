'use client';

import { WalletButton, useAuth } from '@/features/auth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 right-0 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <GnosisIcon className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
          Gnosis Pay
          <span className="mt-1 block text-3xl font-medium text-emerald-500">
            Portfolio Dashboard
          </span>
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-lg text-lg text-muted-foreground">
          Track your card transactions, analyze spending patterns, and maximize your GNO cashback
          rewards — all in one place.
        </p>

        {/* Wallet Button */}
        <WalletButton />

        {/* Stats Preview (shown when not authenticated) */}
        {!isAuthenticated && (
          <div className="mt-16 grid grid-cols-3 gap-8">
            <StatCard label="Transaction Tracking" value="Real-time" />
            <StatCard label="Up to" value="5% Cashback" highlight />
            <StatCard label="Spending Analytics" value="Visual" />
          </div>
        )}

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <FeaturePill>SIWE Authentication</FeaturePill>
          <FeaturePill>GNO Rewards</FeaturePill>
          <FeaturePill>Category Insights</FeaturePill>
          <FeaturePill>Export Reports</FeaturePill>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-muted-foreground/60">
        Built for the Gnosis ecosystem
      </footer>
    </main>
  );
}

/**
 * Stat card component
 */
function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${highlight ? 'text-emerald-500' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * Feature pill component
 */
function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/50 bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
      {children}
    </span>
  );
}

/**
 * Gnosis icon
 */
function GnosisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="currentColor"
      />
      <path
        d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
