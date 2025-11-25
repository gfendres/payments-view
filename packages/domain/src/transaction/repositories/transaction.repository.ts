import type { Result } from '../../shared/result';
import type { DomainError } from '../../shared/errors';
import type { Transaction } from '../entities/transaction';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Transaction filter parameters
 */
export interface TransactionFilters {
  before?: Date;
  after?: Date;
  billingCurrency?: string;
  mcc?: string;
  transactionType?: string;
  cardTokens?: string[];
}

/**
 * Transaction query parameters
 */
export interface TransactionQueryParams extends PaginationParams, TransactionFilters {}

/**
 * Paginated transactions result
 */
export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Transaction repository interface
 */
export interface ITransactionRepository {
  /**
   * Get paginated list of transactions
   */
  getTransactions(
    token: string,
    params?: TransactionQueryParams
  ): Promise<Result<PaginatedTransactions, DomainError>>;

  /**
   * Get a single transaction by ID
   */
  getTransaction(
    token: string,
    transactionId: string
  ): Promise<Result<Transaction, DomainError>>;
}

