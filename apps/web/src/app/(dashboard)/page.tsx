'use client';

import { useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { CATEGORIES } from '@payments-view/constants';

import { useAuthContext } from '@/features/auth';
import {
  TransactionList,
  FilterPanel,
  useTransactions,
  useTransactionFilters,
  type SerializedTransaction,
} from '@/features/transactions';

/**
 * Filter transactions client-side based on search and categories
 */
function filterTransactions(
  transactions: SerializedTransaction[],
  filters: ReturnType<typeof useTransactionFilters>['filters']
): SerializedTransaction[] {
  return transactions.filter((tx) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesMerchant = tx.merchant.name.toLowerCase().includes(searchLower);
      const matchesCategory = tx.merchant.category.toLowerCase().includes(searchLower);
      if (!matchesMerchant && !matchesCategory) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      const categoryNames = filters.categories.map((id) => CATEGORIES[id].name);
      if (!categoryNames.includes(tx.merchant.category)) return false;
    }

    // Status filter
    if (filters.status && tx.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Dashboard content component (needs Suspense for useSearchParams)
 */
function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, isConnected, walletAddress, signOut } = useAuthContext();
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();

  const {
    transactions: rawTransactions,
    isLoading,
    error,
    hasMore,
    refetch,
  } = useTransactions({
    limit: 50,
    enabled: isAuthenticated,
    ...queryParams,
  });

  // Apply client-side filters
  const transactions = useMemo(
    () => filterTransactions(rawTransactions, filters),
    [rawTransactions, filters]
  );

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

  // Calculate stats from filtered transactions
  const thisMonthCount = transactions.filter((t) => {
    const date = new Date(t.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const cashbackEligibleCount = transactions.filter((t) => t.isEligibleForCashback).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
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
                {hasActiveFilters ? 'Filtered Results' : 'Total Transactions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{transactions.length}</p>
              {hasActiveFilters && rawTransactions.length !== transactions.length && (
                <p className="text-xs text-muted-foreground">of {rawTransactions.length} total</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{thisMonthCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cashback Eligible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-500">{cashbackEligibleCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Transactions Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {hasActiveFilters ? 'Filtered Transactions' : 'Recent Transactions'}
            </CardTitle>
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
                {hasMore && !isLoading && transactions.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                )}
                {!isLoading && transactions.length === 0 && rawTransactions.length > 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-12">
                    <div className="mb-4 text-4xl opacity-50">🔍</div>
                    <h3 className="text-lg font-medium text-foreground">No matching transactions</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
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

/**
 * Dashboard page with Suspense boundary for useSearchParams
 */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-4xl">📊</div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
