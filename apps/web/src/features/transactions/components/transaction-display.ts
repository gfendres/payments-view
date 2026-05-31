import {
  CATEGORIES,
  CategoryId,
  TransactionKind,
  TransactionStatus,
} from '@payments-view/constants';

import type { SerializedTransaction } from './transaction-row';

export type StatusBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'pending';

/**
 * Format date for compact list display.
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for compact list display.
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a full date/time for transaction details.
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get category config by id with name fallback for legacy data.
 */
export function getCategory(categoryId: CategoryId, categoryName: string) {
  const category = CATEGORIES[categoryId];
  if (category) {
    return category;
  }

  const entries = Object.entries(CATEGORIES);
  const fallback = entries.find(([, config]) => config.name === categoryName);
  return fallback ? fallback[1] : CATEGORIES[CategoryId.OTHER];
}

/**
 * Get status badge variant.
 */
export function getStatusVariant(
  status: TransactionStatus,
  isPending: boolean
): StatusBadgeVariant {
  if (isPending) return 'pending';
  if (status === TransactionStatus.APPROVED) return 'success';
  if (status === TransactionStatus.REVERSAL || status === TransactionStatus.PARTIAL_REVERSAL) {
    return 'secondary';
  }
  return 'destructive';
}

/**
 * Get status display text.
 */
export function getStatusText(status: TransactionStatus, isPending: boolean): string {
  if (isPending) return 'Pending';
  if (status === TransactionStatus.APPROVED) return 'Completed';
  if (status === TransactionStatus.REVERSAL) return 'Reversed';
  if (status === TransactionStatus.PARTIAL_REVERSAL) return 'Partial';
  return status;
}

export function isPositiveTransaction(transaction: SerializedTransaction): boolean {
  return (
    transaction.kind === TransactionKind.REFUND ||
    transaction.kind === TransactionKind.REVERSAL
  );
}

/**
 * Calculate cashback earned for a transaction.
 */
export function calculateCashback(amount: number, rate: number): number {
  return Math.abs(amount) * (rate / 100);
}

/**
 * Format cashback amount.
 */
export function formatCashback(amount: number): string {
  return `+\u20ac${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSignedBillingAmount(transaction: SerializedTransaction): string {
  const prefix = isPositiveTransaction(transaction) ? '+' : '-';
  return `${prefix}${transaction.billingAmount.formatted}`;
}

export function shortenHash(value: string, visibleCharacters = 6): string {
  if (value.length <= visibleCharacters * 2 + 3) {
    return value;
  }

  return `${value.slice(0, visibleCharacters)}...${value.slice(-visibleCharacters)}`;
}
