import {
  CurrencyCode,
  type CurrencyCode as CurrencyCodeType,
  isTransactionKind,
  TransactionKind,
  TransactionStatus,
  TransactionType,
} from '@payments-view/constants';
import { Merchant, Money, Transaction } from '@payments-view/domain/transaction';

import type { ApiCurrency, ApiTransaction } from '../types';

/**
 * Map numeric ISO 4217 currency codes to alpha codes
 * Only includes currencies defined in our CurrencyCode enum
 */
const NUMERIC_TO_ALPHA_CURRENCY: Record<string, CurrencyCodeType> = {
  '978': CurrencyCode.EUR,  // Euro
  '840': CurrencyCode.USD,  // US Dollar
  '826': CurrencyCode.GBP,  // British Pound
  '756': CurrencyCode.CHF,  // Swiss Franc
  '208': CurrencyCode.DKK,  // Danish Krone
  '578': CurrencyCode.NOK,  // Norwegian Krone
  '752': CurrencyCode.SEK,  // Swedish Krona
  '985': CurrencyCode.PLN,  // Polish Zloty
  '203': CurrencyCode.CZK,  // Czech Koruna
  '348': CurrencyCode.HUF,  // Hungarian Forint
};

/**
 * Convert currency code (numeric or alpha) to CurrencyCode enum
 * API might return either "978" or "EUR"
 */
function normalizeCurrencyCode(code: string): CurrencyCodeType {
  // Try numeric lookup first
  const fromNumeric = NUMERIC_TO_ALPHA_CURRENCY[code];
  if (fromNumeric) {
    return fromNumeric;
  }

  // Check if it's already a valid alpha code
  if (Object.values(CurrencyCode).includes(code as CurrencyCodeType)) {
    return code as CurrencyCodeType;
  }

  // Fallback to EUR
  console.warn(`[TransactionMapper] Unknown currency code: ${code}, defaulting to EUR`);
  return CurrencyCode.EUR;
}

/**
 * Map API amount (string BigInt) + currency object to Money value object
 *
 * Note: Gnosis Pay API returns amounts as separate fields:
 * - billingAmount: "12345" (string BigInt)
 * - billingCurrency: { symbol: "€", code: "978" or "EUR", decimals: 2, name: "Euro" }
 */
function mapAmount(amountStr: string, currency: ApiCurrency): Money {
  const currencyCode = normalizeCurrencyCode(currency.code);
  return Money.create(
    amountStr,
    currencyCode,
    currency.decimals
  );
}

/**
 * Map API merchant to Merchant entity
 *
 * Note: API has mcc at root level, not inside merchant
 * Note: merchant.country is an object { name, alpha2, ... }, we extract alpha2
 */
function mapMerchant(apiTransaction: ApiTransaction): Merchant {
  const { merchant, mcc } = apiTransaction;

  // Extract country code from country object (use alpha2 for display)
  const countryCode = merchant.country?.alpha2;

  return Merchant.create({
    name: merchant.name,
    city: merchant.city,
    country: countryCode,
    mcc: mcc,
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
 * Note: API uses 'transactionType' not 'type'
 */
function mapTransactionType(transactionType: string): TransactionType {
  const typeMap: Record<string, TransactionType> = {
    '00': TransactionType.PURCHASE,
    '01': TransactionType.ATM,
  };

  return typeMap[transactionType] ?? TransactionType.PURCHASE;
}

/**
 * Extract last 4 digits from card token
 */
function extractCardLast4(cardToken: string): string {
  return cardToken.slice(-4);
}

/**
 * Map a single API transaction to domain Transaction entity
 *
 * Field mapping from Gnosis Pay API:
 * - threadId → id (API has no separate id field)
 * - transactionType → type
 * - impactsCashback → isEligibleForCashback
 * - billingAmount (string) + billingCurrency (object) → billingAmount (Money)
 */
export function mapTransaction(apiTransaction: ApiTransaction): Transaction {
  return Transaction.create({
    id: apiTransaction.threadId, // Use threadId as id
    threadId: apiTransaction.threadId,
    kind: mapTransactionKind(apiTransaction.kind),
    status: mapTransactionStatus(apiTransaction.status),
    type: mapTransactionType(apiTransaction.transactionType),
    billingAmount: mapAmount(apiTransaction.billingAmount, apiTransaction.billingCurrency),
    transactionAmount: mapAmount(apiTransaction.transactionAmount, apiTransaction.transactionCurrency),
    merchant: mapMerchant(apiTransaction),
    cardTokenLast4: extractCardLast4(apiTransaction.cardToken),
    isPending: apiTransaction.isPending,
    isEligibleForCashback: apiTransaction.impactsCashback ?? false,
    createdAt: new Date(apiTransaction.createdAt),
    clearedAt: apiTransaction.clearedAt ? new Date(apiTransaction.clearedAt) : undefined,
    onChainTxHash: apiTransaction.transactions?.[0]?.hash,
  });
}

/**
 * Map multiple API transactions to domain entities
 */
export function mapTransactions(apiTransactions: ApiTransaction[]): Transaction[] {
  return apiTransactions.map(mapTransaction);
}
