'use client';

import { useMemo, Suspense } from 'react';
import { Download, RefreshCw, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { CATEGORIES } from '@payments-view/constants';

import {
  TransactionList,
  FilterPanel,
  useTransactions,
  useTransactionFilters,
  useExportTransactions,
  type SerializedTransaction,
} from '@/features/transactions';

/**
 * Filter transactions client-side based on search, categories, and amount
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

    // Amount range filtering
    const amount = Math.abs(tx.billingAmount.amount);
    if (filters.amountRange.min !== undefined && amount < filters.amountRange.min) {
      return false;
    }
    if (filters.amountRange.max !== undefined && amount > filters.amountRange.max) {
      return false;
    }

    return true;
  });
}

function TransactionsContent() {
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();
  const { exportToCsv, isExporting } = useExportTransactions();

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

  const handleExport = () => {
    exportToCsv(transactions);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your card transactions</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting || transactions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="mb-6">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {hasActiveFilters ? 'Filtered Transactions' : 'All Transactions'}
            {transactions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({transactions.length} transactions)
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
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
            <CreditCard className="mx-auto mb-4 h-10 w-10 animate-pulse text-muted-foreground" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}

