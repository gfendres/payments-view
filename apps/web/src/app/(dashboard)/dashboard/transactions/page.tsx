'use client';

import { useMemo, Suspense, useState } from 'react';
import { Download, RefreshCw, CreditCard, List, LayoutGrid, FileText, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { CATEGORIES } from '@payments-view/constants';

import {
  TransactionList,
  VirtualTransactionList,
  Pagination,
  FilterPanel,
  usePaginatedTransactions,
  useTransactionFilters,
  useExportTransactions,
  type SerializedTransaction,
} from '@/features/transactions';

type ViewMode = 'virtual' | 'paginated';

const PAGE_SIZE = 20;

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
  const [viewMode, setViewMode] = useState<ViewMode>('virtual');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { filters, setFilters, hasActiveFilters, queryParams } = useTransactionFilters();
  const { exportToCsv, exportToPdf, isExporting } = useExportTransactions();

  const {
    transactions: rawTransactions,
    total,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = usePaginatedTransactions({
    pageSize: PAGE_SIZE,
    enabled: true,
    ...queryParams,
  });

  const transactions = useMemo(
    () => filterTransactions(rawTransactions, filters),
    [rawTransactions, filters]
  );

  // Calculate pagination for paginated view
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paginatedTransactions = useMemo(() => {
    if (viewMode !== 'paginated') return transactions;
    const start = (currentPage - 1) * PAGE_SIZE;
    return transactions.slice(start, start + PAGE_SIZE);
  }, [transactions, currentPage, viewMode]);

  const handleExportCsv = () => {
    exportToCsv(transactions);
    setShowExportMenu(false);
  };

  const handleExportPdf = () => {
    exportToPdf(transactions);
    setShowExportMenu(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your card transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-1">
            <Button
              variant={viewMode === 'virtual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('virtual')}
              className="h-7 px-2"
              title="Infinite scroll"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'paginated' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('paginated');
                setCurrentPage(1);
              }}
              className="h-7 px-2"
              title="Paginated view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || transactions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Export CSV</div>
                      <div className="text-xs text-muted-foreground">Spreadsheet format</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Export PDF</div>
                      <div className="text-xs text-muted-foreground">Printable report</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
                ({transactions.length}{total > transactions.length ? `+` : ''} transactions)
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
          ) : viewMode === 'virtual' ? (
            <VirtualTransactionList
              transactions={transactions}
              isLoading={isLoading}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              height={600}
            />
          ) : (
            <>
              <TransactionList transactions={paginatedTransactions} isLoading={isLoading} />
              {transactions.length > PAGE_SIZE && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={transactions.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                  />
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

