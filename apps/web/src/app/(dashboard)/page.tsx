'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';

import { useAuthContext } from '@/features/auth';
import { TransactionList, useTransactions } from '@/features/transactions';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isConnected, walletAddress, signOut } = useAuthContext();
  const { transactions, isLoading, error, hasMore, refetch } = useTransactions({
    limit: 20,
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isConnected) {
      router.push('/');
    }
  }, [isAuthenticated, isConnected, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="mt-2 text-muted-foreground">
            Please connect your wallet and sign in to view your transactions.
          </p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gnosis Pay Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {transactions.filter((t) => {
                  const date = new Date(t.createdAt);
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  );
                }).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cashback Eligible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-500">
                {transactions.filter((t) => t.isEligibleForCashback).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <TransactionList transactions={transactions} isLoading={isLoading} />
                {hasMore && !isLoading && (
                  <div className="mt-4 text-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

