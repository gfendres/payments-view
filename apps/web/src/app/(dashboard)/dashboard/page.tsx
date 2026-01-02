'use client';

import { useMemo, Suspense, useState } from 'react';
import { RefreshCw, ReceiptText, Calendar, Download, FileText, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, StatCard } from '@payments-view/ui';

import { useAuth } from '@/features/auth';
import { useRewards, useCashbackStats, EarnedThisMonthCard } from '@/features/rewards';
import {
  TransactionList,
  FilterPanel,
  SpendingChart,
  useTransactions,
  useAllTransactions,
  useTransactionFilters,
  useExportTransactions,
} from '@/features/transactions';
import { applyTransactionFilters } from '@/features/transactions/lib/transaction-use-cases';

/**
 * Dashboard content component
 */
// Default cashback rate when rewards API hasn't loaded yet
const DEFAULT_CASHBACK_RATE = 3.84;

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();
  const { exportToCsv, exportToPdf, isExporting } = useExportTransactions();
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch limited transactions for display
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

  // Fetch all transactions for accurate stats calculation
  const {
    transactions: allTransactions,
    isFetching: isFetchingAllTransactions,
  } = useAllTransactions({ enabled: isAuthenticated });

  // Get actual cashback rate from rewards API
  const { rewards } = useRewards({ enabled: isAuthenticated });
  const cashbackRate = rewards?.currentRate ?? DEFAULT_CASHBACK_RATE;

  // Apply client-side filters to display transactions
  const { transactions } = useMemo(
    () => applyTransactionFilters(rawTransactions, filters),
    [rawTransactions, filters]
  );

  // Apply filters to all transactions for stats calculation
  const { transactions: filteredAllTransactions } = useMemo(
    () => applyTransactionFilters(allTransactions, filters),
    [allTransactions, filters]
  );

  // Calculate cashback stats from filtered complete dataset
  const { stats: cashbackStats } = useCashbackStats({
    transactions: filteredAllTransactions,
    cashbackRate,
    enabled: isAuthenticated,
  });

  // Helper: Check if date range filter is active
  const hasDateRangeFilter = useMemo(() => {
    return filters.dateRange.from !== undefined || filters.dateRange.to !== undefined;
  }, [filters.dateRange]);

  // Calculate transaction count stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Previous month (for trend calculation when no filters)
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let periodCount: number;
    let prevPeriodCount: number | undefined;

    if (hasDateRangeFilter) {
      // When date range filter is active: count transactions within the filtered date range
      const fromDate = filters.dateRange.from
        ? new Date(filters.dateRange.from)
        : undefined;
      const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : undefined;

      periodCount = filteredAllTransactions.filter((t) => {
        const txDate = new Date(t.createdAt);
        if (fromDate && txDate < fromDate) return false;
        if (toDate && txDate > toDate) return false;
        return true;
      }).length;

      // No previous period comparison when date range filter is active
      prevPeriodCount = undefined;
    } else {
      // When no date range filter: count this month's transactions (respects other filters)
      const thisMonthTx = filteredAllTransactions.filter((t) => {
        const date = new Date(t.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      // Previous month's transactions (for trend when no filters)
      const prevMonthTx = filteredAllTransactions.filter((t) => {
        const date = new Date(t.createdAt);
        return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
      });

      periodCount = thisMonthTx.length;
      prevPeriodCount = prevMonthTx.length;
    }

    return {
      periodCount,
      prevPeriodCount,
      totalTransactions: filteredAllTransactions.length,
    };
  }, [filteredAllTransactions, hasDateRangeFilter, filters.dateRange]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Track your spending and cashback rewards</p>
        </div>

        <div className="space-y-3 rounded-2xl bg-card/40 p-4 shadow-sm">
          <FilterPanel filters={filters} onFiltersChange={setFilters} transactions={rawTransactions} />
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

          {/* Hide "In Selected Range" when date range filter is active (redundant with Filtered Results) */}
          {!hasDateRangeFilter ? (
            <StatCard
              title={hasActiveFilters ? 'This Month (Filtered)' : 'This Month'}
              value={stats.periodCount}
              icon={<Calendar className="h-5 w-5" />}
              iconColor="violet"
              trend={
                !hasActiveFilters && stats.prevPeriodCount !== undefined
                  ? {
                      value: stats.periodCount,
                      previousValue: stats.prevPeriodCount,
                      period: 'last month',
                    }
                  : undefined
              }
            />
          ) : null}

          <EarnedThisMonthCard
            stats={cashbackStats}
            isLoading={isFetchingAllTransactions}
            isFiltered={hasActiveFilters}
          />
        </div>

        {/* Right column - Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart
              transactions={filteredAllTransactions}
              showTimeControls={true}
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
              <TransactionList
                transactions={transactions}
                isLoading={isLoading}
                cashbackRate={cashbackRate}
              />
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
