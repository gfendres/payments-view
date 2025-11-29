'use client';

import { useMemo, Suspense, useState } from 'react';
import { RefreshCw, ReceiptText, Calendar, Coins, Download, FileText, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, StatCard } from '@payments-view/ui';

import { useAuth } from '@/features/auth';
import {
  TransactionList,
  FilterPanel,
  SpendingChart,
  useTransactions,
  useTransactionFilters,
  useExportTransactions,
} from '@/features/transactions';
import { applyTransactionFilters } from '@/features/transactions/lib/transaction-use-cases';

/**
 * Dashboard content component
 */
function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();
  const { exportToCsv, exportToPdf, isExporting } = useExportTransactions();
  const [showExportMenu, setShowExportMenu] = useState(false);

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
  const { transactions } = useMemo(
    () => applyTransactionFilters(rawTransactions, filters),
    [rawTransactions, filters]
  );

  // Calculate stats from filtered transactions
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Previous month
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // This month's transactions
    const thisMonthTx = transactions.filter((t) => {
      const date = new Date(t.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    // Previous month's transactions
    const prevMonthTx = transactions.filter((t) => {
      const date = new Date(t.createdAt);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Cashback eligible counts
    const thisMonthEligible = thisMonthTx.filter((t) => t.isEligibleForCashback);
    const prevMonthEligible = prevMonthTx.filter((t) => t.isEligibleForCashback);

    // Calculate cashback earned (estimate based on 3.84% rate - will be updated with actual rate)
    const CASHBACK_RATE = 0.0384; // Default rate, ideally fetched from rewards API
    const monthlyEligibleSpend = thisMonthEligible.reduce(
      (sum, tx) => sum + Math.abs(tx.billingAmount.amount),
      0
    );
    const earnedThisMonth = monthlyEligibleSpend * CASHBACK_RATE;
    const projectedYearlyCashback = earnedThisMonth * 12;

    const earnedLastMonth = prevMonthEligible.reduce(
      (sum, tx) => sum + Math.abs(tx.billingAmount.amount) * CASHBACK_RATE,
      0
    );

    return {
      thisMonthCount: thisMonthTx.length,
      prevMonthCount: prevMonthTx.length,
      cashbackEligibleCount: thisMonthEligible.length,
      prevCashbackEligibleCount: prevMonthEligible.length,
      earnedThisMonth,
      projectedYearlyCashback,
      earnedLastMonth,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Track your spending and cashback rewards</p>
        </div>

        <div className="space-y-3 rounded-2xl bg-card/40 p-4 shadow-sm">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Stats and Chart Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Stats */}
        <div className="space-y-4 lg:col-span-1">
          <StatCard
            title={hasActiveFilters ? 'Filtered Results' : 'Total Transactions'}
            value={stats.totalTransactions}
            icon={<ReceiptText className="h-5 w-5" />}
            iconColor="primary"
            subtitle={
              hasActiveFilters && rawTransactions.length !== stats.totalTransactions
                ? `of ${rawTransactions.length} total`
                : undefined
            }
          />

          <StatCard
            title="This Month"
            value={stats.thisMonthCount}
            icon={<Calendar className="h-5 w-5" />}
            iconColor="violet"
            trend={{
              value: stats.thisMonthCount,
              previousValue: stats.prevMonthCount,
              period: 'last month',
            }}
          />

          <StatCard
            title="Earned This Month"
            value={`€${stats.earnedThisMonth.toFixed(2)}`}
            icon={<Coins className="h-5 w-5" />}
            iconColor="emerald"
            valueColor="success"
            subtitle={`Projected: €${stats.projectedYearlyCashback.toFixed(2)} / year`}
            trend={{
              value: stats.earnedThisMonth,
              previousValue: stats.earnedLastMonth,
              period: 'last month',
            }}
          />
        </div>

        {/* Right column - Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart
              transactions={transactions}
              showTimeControls={false}
              initialTimePeriod="all"
            />
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {hasActiveFilters ? 'Filtered Transactions' : 'Recent Transactions'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={isExporting || transactions.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showExportMenu ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="border-border bg-card absolute right-0 z-50 mt-2 w-48 rounded-lg border shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        exportToCsv(transactions);
                        setShowExportMenu(false);
                      }}
                      className="hover:bg-muted flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
                    >
                      <Download className="text-muted-foreground h-4 w-4" />
                      <div>
                        <div className="font-medium">Export CSV</div>
                        <div className="text-muted-foreground text-xs">Spreadsheet format</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportToPdf(transactions);
                        setShowExportMenu(false);
                      }}
                      className="hover:bg-muted flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
                    >
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <div>
                        <div className="font-medium">Export PDF</div>
                        <div className="text-muted-foreground text-xs">Printable report</div>
                      </div>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            <Button variant="subtle" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {error ? (
            <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4 text-center">
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
                <div className="border-border bg-card/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
                  <div className="mb-4 text-4xl opacity-50">🔍</div>
                  <h3 className="text-foreground text-lg font-medium">No matching transactions</h3>
                  <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters</p>
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
