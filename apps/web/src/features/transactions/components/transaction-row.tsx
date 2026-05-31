'use client';
import { ChevronRight } from 'lucide-react';
import {
  TransactionKind,
  TransactionStatus,
  CategoryId,
  TransactionType,
  CurrencyCode,
} from '@payments-view/constants';
import { Badge, cn } from '@payments-view/ui';

import { CategoryIcon } from '@/components/atoms/category-icon';

import {
  calculateCashback,
  formatCashback,
  formatShortDate,
  formatTime,
  getCategory,
  getStatusText,
  getStatusVariant,
  isPositiveTransaction,
} from './transaction-display';

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
  /** Cashback rate as percentage (e.g., 3.85 for 3.85%). If provided, shows cashback earned for eligible transactions */
  cashbackRate?: number;
}

/**
 * Transaction row component
 */
export function TransactionRow({ transaction, onClick, cashbackRate }: TransactionRowProps) {
  const category = getCategory(transaction.merchant.categoryId, transaction.merchant.category);
  const isPositive = isPositiveTransaction(transaction);
  const isInteractive = Boolean(onClick);

  // Calculate cashback if rate is provided and transaction is eligible
  const showCashback = cashbackRate && transaction.isEligibleForCashback && !isPositive;
  const cashbackEarned = showCashback
    ? calculateCashback(transaction.billingAmount.amount, cashbackRate)
    : 0;

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      aria-label={`Open details for ${transaction.merchant.name} transaction`}
      disabled={!isInteractive}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-all duration-200 sm:gap-4 sm:p-4',
        'bg-muted/35 border-border/70 shadow-sm shadow-black/5 dark:bg-white/[0.03] dark:shadow-black/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isInteractive
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 dark:hover:bg-primary/15'
          : 'cursor-default opacity-90'
      )}
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
          {transaction.merchant.city ? <>
              <span className="text-border">•</span>
              <span className="truncate">{transaction.merchant.city}</span>
            </> : null}
        </div>
      </div>

      {/* Amount & Status */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {showCashback ? <span className="text-[11px] font-medium tabular-nums text-emerald-500 sm:text-xs">
              {formatCashback(cashbackEarned)}
            </span> : null}
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
            {formatShortDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </span>
          <Badge
            variant={getStatusVariant(transaction.status, transaction.isPending)}
            className="px-2 py-0.5 text-[11px] leading-tight sm:text-xs"
          >
            {getStatusText(transaction.status, transaction.isPending)}
          </Badge>
        </div>
      </div>

      <ChevronRight
        className={cn(
          'hidden h-4 w-4 shrink-0 transition-all sm:block',
          isInteractive
            ? 'text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-primary'
            : 'text-muted-foreground/30'
        )}
      />
    </button>
  );
}
