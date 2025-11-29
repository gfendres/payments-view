'use client';
import {
  TransactionKind,
  TransactionStatus,
  CATEGORIES,
  CategoryId,
  TransactionType,
  CurrencyCode,
} from '@payments-view/constants';
import { Badge } from '@payments-view/ui';

import { CategoryIcon } from '@/components/atoms/category-icon';

/**
 * Serialized transaction from API
 */
export interface SerializedTransaction {
  id: string;
  threadId: string;
  kind: TransactionKind;
  status: TransactionStatus;
  type: TransactionType;
  billingAmount: {
    amount: number;
    currency: CurrencyCode;
    formatted: string;
  };
  transactionAmount: {
    amount: number;
    currency: CurrencyCode;
    formatted: string;
  };
  merchant: {
    name: string;
    city?: string;
    country?: string;
    category: string;
    categoryId: CategoryId;
    mcc: string;
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
function getCategory(categoryId: CategoryId, categoryName: string) {
  const category = CATEGORIES[categoryId];
  if (category) {
    return category;
  }

  const entries = Object.entries(CATEGORIES);
  const fallback = entries.find(([, config]) => config.name === categoryName);
  return fallback ? fallback[1] : CATEGORIES[CategoryId.OTHER];
}

/**
 * Get status badge variant
 */
function getStatusVariant(
  status: TransactionStatus,
  isPending: boolean
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'pending' {
  if (isPending) return 'pending';
  if (status === TransactionStatus.APPROVED) return 'success';
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
  const category = getCategory(transaction.merchant.categoryId, transaction.merchant.category);
  const isRefund = transaction.kind === TransactionKind.REFUND;
  const isReversal = transaction.kind === TransactionKind.REVERSAL;
  const isPositive = isRefund || isReversal;

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className="group bg-card/50 hover:bg-card flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all hover:shadow-md sm:gap-4 sm:p-4"
    >
      {/* Category Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
        style={{ backgroundColor: `${category.color}20`, color: category.color }}
      >
        <CategoryIcon icon={category.icon} size={22} />
      </div>

      {/* Transaction Details */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <span className="text-foreground line-clamp-2 text-sm font-medium leading-snug sm:line-clamp-3 sm:text-base sm:leading-tight">
            {transaction.merchant.name}
          </span>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
          <span className="truncate">{category.name}</span>
          {transaction.merchant.city && (
            <>
              <span className="text-border">•</span>
              <span className="truncate">{transaction.merchant.city}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount & Status */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-base font-semibold tabular-nums sm:text-lg ${
              isPositive ? 'text-emerald-500' : 'text-foreground'
            }`}
          >
            {isPositive ? '+' : '-'}
            {transaction.billingAmount.formatted}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-muted-foreground text-[11px] leading-tight sm:text-xs">
            {formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </span>
          <Badge
            variant={getStatusVariant(transaction.status, transaction.isPending)}
            className="px-2 py-0.5 text-[11px] leading-tight sm:text-xs"
          >
            {getStatusText(transaction.status, transaction.isPending)}
          </Badge>
        </div>
      </div>
    </button>
  );
}
