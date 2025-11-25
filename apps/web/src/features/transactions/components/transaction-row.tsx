'use client';

import { TransactionKind, TransactionStatus, CATEGORIES, CategoryId } from '@payments-view/constants';
import { Badge } from '@payments-view/ui';

/**
 * Serialized transaction from API
 */
export interface SerializedTransaction {
  id: string;
  threadId: string;
  kind: TransactionKind;
  status: TransactionStatus;
  type: string;
  billingAmount: {
    amount: number;
    currency: string;
    formatted: string;
  };
  transactionAmount: {
    amount: number;
    currency: string;
    formatted: string;
  };
  merchant: {
    name: string;
    city?: string;
    country?: string;
    category: string;
  };
  cardTokenLast4: string;
  isPending: boolean;
  isEligibleForCashback: boolean;
  createdAt: string;
  clearedAt?: string;
  onChainTxHash?: string;
}

interface TransactionRowProps {
  transaction: SerializedTransaction;
  onClick?: (transaction: SerializedTransaction) => void;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Get category config by name
 */
function getCategoryByName(categoryName: string) {
  const entries = Object.entries(CATEGORIES);
  const found = entries.find(([, config]) => config.name === categoryName);
  return found ? found[1] : CATEGORIES[CategoryId.OTHER];
}

/**
 * Get status badge variant
 */
function getStatusVariant(
  status: TransactionStatus,
  isPending: boolean
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (isPending) return 'outline';
  if (status === TransactionStatus.APPROVED) return 'default';
  if (status === TransactionStatus.REVERSAL || status === TransactionStatus.PARTIAL_REVERSAL) {
    return 'secondary';
  }
  return 'destructive';
}

/**
 * Get status display text
 */
function getStatusText(status: TransactionStatus, isPending: boolean): string {
  if (isPending) return 'Pending';
  if (status === TransactionStatus.APPROVED) return 'Completed';
  if (status === TransactionStatus.REVERSAL) return 'Reversed';
  if (status === TransactionStatus.PARTIAL_REVERSAL) return 'Partial';
  return status;
}

/**
 * Transaction row component
 */
export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const category = getCategoryByName(transaction.merchant.category);
  const isRefund = transaction.kind === TransactionKind.REFUND;
  const isReversal = transaction.kind === TransactionKind.REVERSAL;
  const isPositive = isRefund || isReversal;

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className="group flex w-full items-center gap-4 rounded-xl bg-card/50 p-4 text-left transition-all hover:bg-card hover:shadow-md"
    >
      {/* Category Icon */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>

      {/* Transaction Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {transaction.merchant.name}
          </span>
          {transaction.isEligibleForCashback && (
            <span className="text-xs text-emerald-500" title="Eligible for cashback">
              💰
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{category.name}</span>
          {transaction.merchant.city && (
            <>
              <span className="text-border">•</span>
              <span>{transaction.merchant.city}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount & Status */}
      <div className="flex flex-col items-end gap-1">
        <span
          className={`text-lg font-semibold tabular-nums ${
            isPositive ? 'text-emerald-500' : 'text-foreground'
          }`}
        >
          {isPositive ? '+' : '-'}
          {transaction.billingAmount.formatted}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </span>
          <Badge variant={getStatusVariant(transaction.status, transaction.isPending)} className="text-xs">
            {getStatusText(transaction.status, transaction.isPending)}
          </Badge>
        </div>
      </div>
    </button>
  );
}

