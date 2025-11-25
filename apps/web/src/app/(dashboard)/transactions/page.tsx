'use client';

import { useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { CATEGORIES } from '@payments-view/constants';

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
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesMerchant = tx.merchant.name.toLowerCase().includes(searchLower);
      const matchesCategory = tx.merchant.category.toLowerCase().includes(searchLower);
      if (!matchesMerchant && !matchesCategory) return false;
    }

    if (filters.categories.length > 0) {
      const categoryNames = filters.categories.map((id) => CATEGORIES[id].name);
      if (!categoryNames.includes(tx.merchant.category)) return false;
    }

    if (filters.status && tx.status !== filters.status) {
      return false;
    }

    return true;
  });
}

function TransactionsContent() {
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

  const transactions = useMemo(
    () => filterTransactions(rawTransactions, filters),
    [rawTransactions, filters]
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage your card transactions</p>
      </div>

      <div className="mb-6">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {hasActiveFilters ? 'Filtered Transactions' : 'All Transactions'}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-4xl">💳</div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}

