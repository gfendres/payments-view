/**
 * Transaction status enum representing the outcome of a card transaction
 */
export enum TransactionStatus {
  APPROVED = 'Approved',
  INCORRECT_PIN = 'IncorrectPin',
  INSUFFICIENT_FUNDS = 'InsufficientFunds',
  EXCEEDS_LIMIT = 'ExceedsApprovalAmountLimit',
  INVALID_AMOUNT = 'InvalidAmount',
  PIN_TRIES_EXCEEDED = 'PinEntryTriesExceeded',
  INCORRECT_SECURITY_CODE = 'IncorrectSecurityCode',
  REVERSAL = 'Reversal',
  PARTIAL_REVERSAL = 'PartialReversal',
  OTHER = 'Other',
}

/**
 * Check if a transaction status indicates success
 */
export function isSuccessStatus(status: TransactionStatus): boolean {
  return status === TransactionStatus.APPROVED;
}

/**
 * Check if a transaction status indicates a declined transaction
 */
export function isDeclinedStatus(status: TransactionStatus): boolean {
  const declinedStatuses: TransactionStatus[] = [
    TransactionStatus.INCORRECT_PIN,
    TransactionStatus.INSUFFICIENT_FUNDS,
    TransactionStatus.EXCEEDS_LIMIT,
    TransactionStatus.INVALID_AMOUNT,
    TransactionStatus.PIN_TRIES_EXCEEDED,
    TransactionStatus.INCORRECT_SECURITY_CODE,
  ];
  return declinedStatuses.includes(status);
}

/**
 * Returns a user-friendly message for a transaction status
 */
export function getTransactionStatusMessage(status: TransactionStatus): string {
  const messages: Record<TransactionStatus, string> = {
    [TransactionStatus.APPROVED]: 'Transaction approved',
    [TransactionStatus.INCORRECT_PIN]: 'Incorrect PIN entered',
    [TransactionStatus.INSUFFICIENT_FUNDS]: 'Insufficient funds',
    [TransactionStatus.EXCEEDS_LIMIT]: 'Amount exceeds limit',
    [TransactionStatus.INVALID_AMOUNT]: 'Invalid amount',
    [TransactionStatus.PIN_TRIES_EXCEEDED]: 'PIN entry tries exceeded',
    [TransactionStatus.INCORRECT_SECURITY_CODE]: 'Incorrect security code',
    [TransactionStatus.REVERSAL]: 'Transaction reversed',
    [TransactionStatus.PARTIAL_REVERSAL]: 'Partially reversed',
    [TransactionStatus.OTHER]: 'Transaction declined',
  };
  return messages[status];
}

