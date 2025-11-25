import { API_CONFIG } from '@payments-view/constants';

import { GnosisPayClient } from './client';
import type {
  ApiTransactionsResponse,
  ApiTransaction,
  TransactionQueryParams,
} from './types';
import type { ApiResult } from './types';

/**
 * Build query string from params
 */
function buildQueryString(params: TransactionQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set('offset', params.offset.toString());
  }
  if (params.before) {
    searchParams.set('before', params.before);
  }
  if (params.after) {
    searchParams.set('after', params.after);
  }
  if (params.billingCurrency) {
    searchParams.set('billingCurrency', params.billingCurrency);
  }
  if (params.mcc) {
    searchParams.set('mcc', params.mcc);
  }
  if (params.transactionType) {
    searchParams.set('transactionType', params.transactionType);
  }
  if (params.cardTokens) {
    searchParams.set('cardTokens', params.cardTokens);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Gnosis Pay transaction API client
 */
export class GnosisPayTransactionClient {
  private readonly client: GnosisPayClient;

  constructor(client?: GnosisPayClient) {
    this.client = client ?? new GnosisPayClient();
  }

  /**
   * Get list of transactions
   */
  async getTransactions(
    token: string,
    params: TransactionQueryParams = {}
  ): Promise<ApiResult<ApiTransactionsResponse>> {
    const queryString = buildQueryString(params);
    const endpoint = `${API_CONFIG.GNOSIS_PAY.ENDPOINTS.TRANSACTIONS}${queryString}`;

    return this.client.request<ApiTransactionsResponse>(endpoint, { token });
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(
    token: string,
    transactionId: string
  ): Promise<ApiResult<ApiTransaction>> {
    const endpoint = `${API_CONFIG.GNOSIS_PAY.ENDPOINTS.TRANSACTIONS}/${transactionId}`;

    return this.client.request<ApiTransaction>(endpoint, { token });
  }
}

