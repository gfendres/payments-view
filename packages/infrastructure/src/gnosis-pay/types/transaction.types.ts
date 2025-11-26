/**
 * Gnosis Pay API Transaction Response Types
 *
 * Based on official docs: https://docs.gnosispay.com/api-reference/transactions/list-transactions-without-pagination
 * Last verified: 2024-11-26
 */

/**
 * Country object from API
 */
export interface ApiCountry {
  name: string;
  numeric: string;
  alpha2: string;
  alpha3: string;
}

/**
 * Currency object from API
 */
export interface ApiCurrency {
  symbol: string;
  code: string;
  decimals: number;
  name: string;
}

/**
 * Merchant object from API
 * Note: country is an object, not a string!
 */
export interface ApiMerchant {
  name: string;
  city?: string;
  country?: ApiCountry;
}

/**
 * On-chain transaction from API
 */
export interface ApiOnChainTransaction {
  status: string;
  to?: string;
  value?: string;
  data?: string;
  hash?: string;
}

/**
 * Single transaction from API
 *
 * IMPORTANT: Field names match exactly what Gnosis Pay API returns!
 * - No `id` field, only `threadId`
 * - `billingAmount` is a string (BigInt), not an object
 * - `billingCurrency` is a separate object
 * - `mcc` is at root level, not inside merchant
 * - `transactionType` not `type`
 * - `impactsCashback` not `isEligibleForCashback`
 */
export interface ApiTransaction {
  threadId: string;
  createdAt: string;
  clearedAt?: string | null;
  country?: ApiCountry;
  isPending: boolean;
  impactsCashback?: boolean | null;
  mcc: string;
  merchant: ApiMerchant;
  billingAmount: string; // BigInt as string!
  billingCurrency: ApiCurrency;
  transactionAmount: string; // BigInt as string!
  transactionCurrency: ApiCurrency;
  transactionType: string;
  cardToken: string;
  transactions?: ApiOnChainTransaction[];
  kind: string;
  status: string;
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
