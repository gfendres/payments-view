/**
 * Transaction kind enum representing the type of card transaction
 */
export enum TransactionKind {
  PAYMENT = 'Payment',
  REFUND = 'Refund',
  REVERSAL = 'Reversal',
}

/**
 * Type guard to check if a value is a valid TransactionKind
 */
export function isTransactionKind(value: string): value is TransactionKind {
  return Object.values(TransactionKind).includes(value as TransactionKind);
}

/**
 * Returns the display label for a transaction kind
 */
export function getTransactionKindLabel(kind: TransactionKind): string {
  const labels: Record<TransactionKind, string> = {
    [TransactionKind.PAYMENT]: 'Payment',
    [TransactionKind.REFUND]: 'Refund',
    [TransactionKind.REVERSAL]: 'Reversal',
  };
  return labels[kind];
}

