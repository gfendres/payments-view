import {
  TransactionKind,
  TransactionStatus,
  TransactionType,
  type CurrencyCode,
  isTransactionKind,
} from '@payments-view/constants';
import { Transaction, Merchant, Money } from '@payments-view/domain/transaction';

import type { ApiTransaction, ApiAmount, ApiMerchant } from '../types';

/**
 * Map API amount to Money value object
 */
function mapAmount(apiAmount: ApiAmount): Money {
  return Money.create(
    apiAmount.value,
    apiAmount.currency as CurrencyCode,
    apiAmount.decimals
  );
}

/**
 * Map API merchant to Merchant entity
 */
function mapMerchant(apiMerchant: ApiMerchant): Merchant {
  return Merchant.create({
    name: apiMerchant.name,
    city: apiMerchant.city,
    country: apiMerchant.country,
    mcc: apiMerchant.mcc,
  });
}

/**
 * Map API transaction kind to domain enum
 */
function mapTransactionKind(kind: string): TransactionKind {
  if (isTransactionKind(kind)) {
    return kind;
  }
  // Default to Payment if unknown
  return TransactionKind.PAYMENT;
}

/**
 * Map API status to domain enum
 */
function mapTransactionStatus(status: string): TransactionStatus {
  const statusMap: Record<string, TransactionStatus> = {
    Approved: TransactionStatus.APPROVED,
    IncorrectPin: TransactionStatus.INCORRECT_PIN,
    InsufficientFunds: TransactionStatus.INSUFFICIENT_FUNDS,
    ExceedsApprovalAmountLimit: TransactionStatus.EXCEEDS_LIMIT,
    InvalidAmount: TransactionStatus.INVALID_AMOUNT,
    PinEntryTriesExceeded: TransactionStatus.PIN_TRIES_EXCEEDED,
    IncorrectSecurityCode: TransactionStatus.INCORRECT_SECURITY_CODE,
    Reversal: TransactionStatus.REVERSAL,
    PartialReversal: TransactionStatus.PARTIAL_REVERSAL,
  };

  return statusMap[status] ?? TransactionStatus.OTHER;
}

/**
 * Map API type to domain enum
 */
function mapTransactionType(type: string): TransactionType {
  const typeMap: Record<string, TransactionType> = {
    '00': TransactionType.PURCHASE,
    '01': TransactionType.ATM,
  };

  return typeMap[type] ?? TransactionType.PURCHASE;
}

/**
 * Extract last 4 digits from card token
 */
function extractCardLast4(cardToken: string): string {
  return cardToken.slice(-4);
}

/**
 * Map a single API transaction to domain Transaction entity
 */
export function mapTransaction(apiTransaction: ApiTransaction): Transaction {
  return Transaction.create({
    id: apiTransaction.id,
    threadId: apiTransaction.threadId,
    kind: mapTransactionKind(apiTransaction.kind),
    status: mapTransactionStatus(apiTransaction.status),
    type: mapTransactionType(apiTransaction.type),
    billingAmount: mapAmount(apiTransaction.billingAmount),
    transactionAmount: mapAmount(apiTransaction.transactionAmount),
    merchant: mapMerchant(apiTransaction.merchant),
    cardTokenLast4: extractCardLast4(apiTransaction.cardToken),
    isPending: apiTransaction.isPending,
    isEligibleForCashback: apiTransaction.isEligibleForCashback,
    createdAt: new Date(apiTransaction.createdAt),
    clearedAt: apiTransaction.clearedAt ? new Date(apiTransaction.clearedAt) : undefined,
    onChainTxHash: apiTransaction.onChainTxHash,
  });
}

/**
 * Map multiple API transactions to domain entities
 */
export function mapTransactions(apiTransactions: ApiTransaction[]): Transaction[] {
  return apiTransactions.map(mapTransaction);
}

