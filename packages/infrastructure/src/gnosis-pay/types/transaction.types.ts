/**
 * Gnosis Pay API Transaction Response Types
 */

/**
 * Amount object from API
 */
export interface ApiAmount {
  value: string;
  currency: string;
  symbol: string;
  decimals: number;
}

/**
 * Merchant object from API
 */
export interface ApiMerchant {
  name: string;
  city?: string;
  country?: string;
  mcc: string;
}

/**
 * Single transaction from API
 */
export interface ApiTransaction {
  id: string;
  threadId: string;
  kind: string;
  status: string;
  type: string;
  billingAmount: ApiAmount;
  transactionAmount: ApiAmount;
  merchant: ApiMerchant;
  cardToken: string;
  isPending: boolean;
  isEligibleForCashback: boolean;
  createdAt: string;
  clearedAt?: string;
  onChainTxHash?: string;
}

/**
 * Paginated transactions response from API
 */
export interface ApiTransactionsResponse {
  transactions: ApiTransaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Transaction query parameters
 */
export interface TransactionQueryParams {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
  billingCurrency?: string;
  mcc?: string;
  transactionType?: string;
  cardTokens?: string;
}

