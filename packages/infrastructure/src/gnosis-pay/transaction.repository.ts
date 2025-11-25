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
import type { TransactionQueryParams as ApiQueryParams } from './types';

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
   * Get paginated list of transactions
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

    const transactions = mapTransactions(result.data.transactions);

    return Result.ok({
      transactions,
      total: result.data.total,
      limit: result.data.limit,
      offset: result.data.offset,
      hasMore: result.data.hasMore,
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

