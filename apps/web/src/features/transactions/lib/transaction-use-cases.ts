import {
  ExportTransactionsUseCase,
  FilterTransactionsUseCase,
  type ExportTransactionsOutput,
  type TransactionFilterCriteria,
} from '@payments-view/application/use-cases';
import {
  CategoryResolverService,
  Money,
  Merchant,
  Transaction as DomainTransaction,
} from '@payments-view/domain/transaction';
import type { CurrencyCode } from '@payments-view/constants';

import type { TransactionFilters } from '../components/filter-panel';
import type { SerializedTransaction } from '../components';

const categoryResolver = new CategoryResolverService();
const filterTransactionsUseCase = new FilterTransactionsUseCase(categoryResolver);
const exportTransactionsUseCase = new ExportTransactionsUseCase();

/**
 * Map serialized transaction to domain entity
 */
function toDomainTransaction(tx: SerializedTransaction): DomainTransaction {
  const billing = Money.fromNumber(tx.billingAmount.amount, tx.billingAmount.currency as CurrencyCode);
  const original = Money.fromNumber(
    tx.transactionAmount.amount,
    tx.transactionAmount.currency as CurrencyCode
  );

  const merchant = Merchant.create({
    name: tx.merchant.name,
    city: tx.merchant.city,
    country: tx.merchant.country,
    mcc: tx.merchant.mcc,
  });

  return DomainTransaction.create({
    id: tx.id,
    threadId: tx.threadId,
    kind: tx.kind,
    status: tx.status,
    type: tx.type,
    billingAmount: billing,
    transactionAmount: original,
    merchant,
    cardTokenLast4: tx.cardTokenLast4,
    isPending: tx.isPending,
    isEligibleForCashback: tx.isEligibleForCashback,
    createdAt: new Date(tx.createdAt),
    clearedAt: tx.clearedAt ? new Date(tx.clearedAt) : undefined,
    onChainTxHash: tx.onChainTxHash,
  });
}

/**
 * Map collection of serialized transactions to domain entities
 */
function toDomainTransactions(transactions: SerializedTransaction[]): DomainTransaction[] {
  return transactions.map(toDomainTransaction);
}

/**
 * Convert UI filters to domain filter criteria
 */
function toFilterCriteria(filters: TransactionFilters): TransactionFilterCriteria {
  return {
    search: filters.search,
    categories: filters.categories,
    after: filters.dateRange.from,
    before: filters.dateRange.to,
    status: filters.status,
    minAmount: filters.amountRange.min,
    maxAmount: filters.amountRange.max,
  };
}

export interface FilteredTransactionsResult {
  transactions: SerializedTransaction[];
  totalMatched: number;
  appliedFilters: string[];
}

/**
 * Apply domain filtering use case to serialized transactions
 */
export function applyTransactionFilters(
  transactions: SerializedTransaction[],
  filters: TransactionFilters
): FilteredTransactionsResult {
  const domainTransactions = toDomainTransactions(transactions);
  const criteria = toFilterCriteria(filters);

  const result = filterTransactionsUseCase.execute({
    transactions: domainTransactions,
    criteria,
  });

  if (result.isFailure) {
    return {
      transactions,
      totalMatched: transactions.length,
      appliedFilters: [],
    };
  }

  const allowedIds = new Set(result.value.transactions.map((tx: DomainTransaction) => tx.id));

  return {
    transactions: transactions.filter((tx) => allowedIds.has(tx.id)),
    totalMatched: result.value.totalMatched,
    appliedFilters: result.value.appliedFilters,
  };
}

/**
 * Build CSV export content using the application-layer use case
 */
export function buildCsvExport(
  transactions: SerializedTransaction[]
): ExportTransactionsOutput | null {
  const domainTransactions = toDomainTransactions(transactions);
  const result = exportTransactionsUseCase.execute({
    transactions: domainTransactions,
    format: 'csv',
  });

  if (result.isFailure) {
    return null;
  }

  return result.value;
}
