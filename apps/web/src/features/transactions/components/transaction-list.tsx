'use client';

import { Skeleton } from '@payments-view/ui';

import { TransactionRow, type SerializedTransaction } from './transaction-row';

interface TransactionListProps {
  transactions: SerializedTransaction[];
  isLoading?: boolean;
  onTransactionClick?: (transaction: SerializedTransaction) => void;
}

/**
 * Transaction list skeleton
 */
function TransactionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-card/50 p-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-5 w-20" />
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
 * Transaction list component
 */
export function TransactionList({
  transactions,
  isLoading,
  onTransactionClick,
}: TransactionListProps) {
  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onClick={onTransactionClick}
        />
      ))}
    </div>
  );
}

