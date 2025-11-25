'use client';

import { useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { CATEGORIES } from '@payments-view/constants';

import {
  TransactionList,
  FilterPanel,
  SpendingChart,
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
 * Dashboard content component
 */
function DashboardContent() {
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();

  const {
    transactions: rawTransactions,
    isLoading,
    error,
    hasMore,
    refetch,
  } = useTransactions({
    limit: 50,
    enabled: true,
    ...queryParams,
  });

  // Apply client-side filters
  const transactions = useMemo(
    () => filterTransactions(rawTransactions, filters),
    [rawTransactions, filters]
  );

  // Calculate stats from filtered transactions
  const thisMonthCount = transactions.filter((t) => {
    const date = new Date(t.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const cashbackEligibleCount = transactions.filter((t) => t.isEligibleForCashback).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Track your spending and cashback rewards
        </p>
      </div>

      {/* Stats and Chart Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Stats */}
        <div className="space-y-4 lg:col-span-1">
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

        {/* Right column - Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart transactions={transactions} />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div>
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
    </div>
  );
}

/**
 * Dashboard overview page
 */
export default function DashboardOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-4xl">📊</div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

