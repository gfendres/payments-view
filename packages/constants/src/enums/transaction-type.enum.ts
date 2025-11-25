/**
 * Transaction type enum (from ISO 8583)
 * "00" = Purchase
 * "01" = ATM Cash Withdrawal
 */
export enum TransactionType {
  PURCHASE = '00',
  ATM = '01',
}

/**
 * Type guard to check if a value is a valid TransactionType
 */
export function isTransactionType(value: string): value is TransactionType {
  return Object.values(TransactionType).includes(value as TransactionType);
}

/**
 * Returns the display label for a transaction type
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    [TransactionType.PURCHASE]: 'Purchase',
    [TransactionType.ATM]: 'ATM Withdrawal',
  };
  return labels[type];
}

