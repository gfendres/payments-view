'use client';

import { Coins } from 'lucide-react';
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
      className="group bg-card/50 hover:bg-card flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all hover:shadow-md"
    >
      {/* Category Icon */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category.color}20`, color: category.color }}
      >
        <CategoryIcon icon={category.icon} size={24} />
      </div>

      {/* Transaction Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate font-medium">{transaction.merchant.name}</span>
          {transaction.isEligibleForCashback && (
            <span title="Eligible for cashback">
              <Coins className="h-4 w-4 text-emerald-500" />
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-sm">
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
          <span className="text-muted-foreground text-xs">
            {formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </span>
          <Badge
            variant={getStatusVariant(transaction.status, transaction.isPending)}
            className="text-xs"
          >
            {getStatusText(transaction.status, transaction.isPending)}
          </Badge>
        </div>
      </div>
    </button>
  );
}
