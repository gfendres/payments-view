'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@payments-view/ui';

import { TransactionRow, type SerializedTransaction } from './transaction-row';

interface VirtualTransactionListProps {
  transactions: SerializedTransaction[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onTransactionClick?: (transaction: SerializedTransaction) => void;
  /** Cashback rate as percentage (e.g., 3.85 for 3.85%). Shows cashback earned for eligible transactions */
  cashbackRate?: number;
  height?: number;
}

const ITEM_HEIGHT = 76; // Approximate height of TransactionRow
const OVERSCAN = 5; // Number of items to render outside visible area

/**
 * Loading skeleton for virtual list
 */
function VirtualListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl bg-card/50 p-2 sm:gap-4 sm:p-4"
        >
          <Skeleton className="h-10 w-10 rounded-xl sm:h-12 sm:w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-20 sm:h-5" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-16">
      <div className="mb-4 text-5xl opacity-50">📭</div>
      <h3 className="text-lg font-medium text-foreground">No transactions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Your card transactions will appear here
      </p>
    </div>
  );
}

/**
 * Virtualized transaction list for large datasets
 * Uses @tanstack/react-virtual for efficient rendering
 */
export function VirtualTransactionList({
  transactions,
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onTransactionClick,
  cashbackRate,
  height = 600,
}: VirtualTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Add extra row for "Load More" button if there are more items
  const itemCount = hasMore ? transactions.length + 1 : transactions.length;

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
  });

  const handleScroll = useCallback(() => {
    if (!parentRef.current || !hasMore || isFetchingMore || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when user scrolls past 80%
    if (scrollPercentage > 0.8) {
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore]);

  if (isLoading) {
    return <VirtualListSkeleton />;
  }

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-xl"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= transactions.length;

          if (isLoaderRow) {
            return (
              <div
                key="loader"
                className="absolute left-0 top-0 flex w-full items-center justify-center py-4"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isFetchingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    Load More
                  </button>
                )}
              </div>
            );
          }

          const transaction = transactions[virtualItem.index];

          // This should never happen due to the isLoaderRow check above
          if (!transaction) return null;

          return (
            <div
              key={transaction.id}
              className="absolute left-0 top-0 w-full pb-2"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TransactionRow
                transaction={transaction}
                onClick={onTransactionClick}
                cashbackRate={cashbackRate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
