import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError, NotFoundError } from '@payments-view/domain/shared';
import type {
  ITransactionRepository,
  TransactionQueryParams,
  PaginatedTransactions,
} from '@payments-view/domain/transaction';
import type { Transaction } from '@payments-view/domain/transaction';

import { GnosisPayTransactionClient } from './transaction-client';
import { mapTransaction, mapTransactions } from './mappers';
import type { TransactionQueryParams as ApiQueryParams, ApiTransaction } from './types';

/**
 * Convert domain query params to API query params
 */
function toApiQueryParams(params: TransactionQueryParams): ApiQueryParams {
  const apiParams: ApiQueryParams = {};

  if (params.limit !== undefined) {
    apiParams.limit = params.limit;
  }
  if (params.offset !== undefined) {
    apiParams.offset = params.offset;
  }
  if (params.before !== undefined) {
    apiParams.before = params.before.toISOString();
  }
  if (params.after !== undefined) {
    apiParams.after = params.after.toISOString();
  }
  if (params.billingCurrency !== undefined) {
    apiParams.billingCurrency = params.billingCurrency;
  }
  if (params.mcc !== undefined) {
    apiParams.mcc = params.mcc;
  }
  if (params.transactionType !== undefined) {
    apiParams.transactionType = params.transactionType;
  }
  if (params.cardTokens !== undefined && params.cardTokens.length > 0) {
    apiParams.cardTokens = params.cardTokens.join(',');
  }

  return apiParams;
}

/**
 * Gnosis Pay transaction repository implementation
 */
export class GnosisPayTransactionRepository implements ITransactionRepository {
  private readonly client: GnosisPayTransactionClient;

  constructor(client?: GnosisPayTransactionClient) {
    this.client = client ?? new GnosisPayTransactionClient();
  }

  /**
   * Get list of transactions
   *
   * Note: The Gnosis Pay API returns an array directly (not paginated).
   * We simulate pagination on the client side for compatibility.
   * Docs: https://docs.gnosispay.com/api-reference/transactions/list-transactions-without-pagination
   */
  async getTransactions(
    token: string,
    params: TransactionQueryParams = {}
  ): Promise<Result<PaginatedTransactions, ExternalServiceError>> {
    const apiParams = toApiQueryParams(params);
    const result = await this.client.getTransactions(token, apiParams);

    if (!result.success) {
      return Result.err(
        new ExternalServiceError(
          'GnosisPay',
          result.error.message ?? 'Failed to fetch transactions'
        )
      );
    }

    // Debug: Log actual response structure
    console.log('[TransactionRepo] Response type:', typeof result.data);
    console.log('[TransactionRepo] Is array:', Array.isArray(result.data));
    console.log('[TransactionRepo] Keys:', result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'N/A');

    // Handle different API response formats:
    // 1. Paginated: { count, next, previous, results: [...] }
    // 2. Array directly: [...]
    // 3. Wrapper: { data: [...] }
    interface PaginatedResponse { count?: number; next?: string | null; results?: unknown[] }

    let rawTransactions: unknown[];
    let apiTotal: number | undefined;
    let hasMore = false;

    if (Array.isArray(result.data)) {
      rawTransactions = result.data;
    } else if ((result.data as PaginatedResponse).results) {
      // Paginated response format
      const paginated = result.data as PaginatedResponse;
      rawTransactions = paginated.results ?? [];
      apiTotal = paginated.count;
      hasMore = paginated.next != null;
    } else {
      rawTransactions = (result.data as { data?: unknown[] }).data ?? [];
    }

    const apiTransactions = rawTransactions as ApiTransaction[];
    const transactions = mapTransactions(apiTransactions);

    const limit = params.limit ?? transactions.length;
    const offset = params.offset ?? 0;
    const total = apiTotal ?? transactions.length;

    return Result.ok({
      transactions,
      total,
      limit,
      offset,
      hasMore,
    });
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(
    token: string,
    transactionId: string
  ): Promise<Result<Transaction, ExternalServiceError | NotFoundError>> {
    const result = await this.client.getTransaction(token, transactionId);

    if (!result.success) {
      if (result.error.statusCode === 404) {
        return Result.err(new NotFoundError('Transaction', transactionId));
      }

      return Result.err(
        new ExternalServiceError(
          'GnosisPay',
          result.error.message ?? 'Failed to fetch transaction'
        )
      );
    }

    return Result.ok(mapTransaction(result.data));
  }
}

