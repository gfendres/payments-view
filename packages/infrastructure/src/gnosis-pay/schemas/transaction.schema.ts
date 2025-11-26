import { z } from 'zod';

/**
 * Gnosis Pay API Transaction Schemas
 * Based on official docs: https://docs.gnosispay.com/api-reference/transactions/list-transactions-without-pagination
 *
 * These schemas validate the actual API response format at runtime,
 * helping catch mismatches between our types and the real API.
 */

/**
 * Country object schema (used in merchant and transaction)
 */
export const ApiCountrySchema = z.object({
  name: z.string(),
  numeric: z.string(),
  alpha2: z.string(),
  alpha3: z.string(),
}).passthrough(); // Allow extra fields

/**
 * Currency object schema
 */
export const ApiCurrencySchema = z.object({
  symbol: z.string(),
  code: z.string(),
  decimals: z.number(),
  name: z.string(),
}).passthrough();

/**
 * Merchant object schema from API
 */
export const ApiMerchantSchema = z.object({
  name: z.string(),
  city: z.string().optional(),
  country: ApiCountrySchema.optional(),
}).passthrough();

/**
 * On-chain transaction schema
 */
export const ApiOnChainTransactionSchema = z.object({
  status: z.string(),
  to: z.string().optional(),
  value: z.string().optional(),
  data: z.string().optional(),
  hash: z.string().optional(),
}).passthrough();

/**
 * Single transaction from API
 * Note: Uses exact field names from Gnosis Pay API
 */
export const ApiTransactionSchema = z.object({
  threadId: z.string(),
  createdAt: z.string(),
  clearedAt: z.string().nullable().optional(),
  country: ApiCountrySchema.optional(),
  isPending: z.boolean(),
  impactsCashback: z.boolean().nullable().optional(),
  mcc: z.string(),
  merchant: ApiMerchantSchema,
  billingAmount: z.string(), // BigInt as string
  billingCurrency: ApiCurrencySchema,
  transactionAmount: z.string(), // BigInt as string
  transactionCurrency: ApiCurrencySchema,
  transactionType: z.string(),
  cardToken: z.string(),
  transactions: z.array(ApiOnChainTransactionSchema).optional(),
  kind: z.enum(['Payment', 'Refund', 'TopUp', 'Reversal']),
  status: z.enum([
    'Approved',
    'IncorrectPin',
    'InsufficientFunds',
    'ExceedsApprovalAmountLimit',
    'InvalidAmount',
    'PinEntryTriesExceeded',
    'IncorrectSecurityCode',
    'Reversal',
    'PartialReversal',
    'Other',
  ]),
}).passthrough(); // Allow extra fields we don't know about yet

/**
 * Array of transactions (non-paginated endpoint)
 */
export const ApiTransactionsArraySchema = z.array(ApiTransactionSchema);

/**
 * Paginated transactions response schema
 * Note: Check if this matches the actual paginated endpoint
 */
export const ApiTransactionsResponseSchema = z.object({
  transactions: z.array(ApiTransactionSchema),
  total: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  hasMore: z.boolean().optional(),
}).passthrough();

// Export inferred types
export type ApiCountry = z.infer<typeof ApiCountrySchema>;
export type ApiCurrency = z.infer<typeof ApiCurrencySchema>;
export type ApiMerchant = z.infer<typeof ApiMerchantSchema>;
export type ApiTransaction = z.infer<typeof ApiTransactionSchema>;
export type ApiTransactionsResponse = z.infer<typeof ApiTransactionsResponseSchema>;

/**
 * Validate and parse API response with detailed error logging
 */
export function parseApiTransaction(data: unknown): ApiTransaction | null {
  const result = ApiTransactionSchema.safeParse(data);

  if (!result.success) {
    console.error('[API Schema] Transaction validation failed:', {
      errors: result.error.issues,
      receivedData: JSON.stringify(data, null, 2).substring(0, 500),
    });
    return null;
  }

  return result.data;
}

/**
 * Validate and parse API transactions array with detailed error logging
 */
export function parseApiTransactions(data: unknown): ApiTransaction[] {
  if (!Array.isArray(data)) {
    console.error('[API Schema] Expected array of transactions, got:', typeof data);
    return [];
  }

  const parsed: ApiTransaction[] = [];

  for (let i = 0; i < data.length; i++) {
    const result = ApiTransactionSchema.safeParse(data[i]);

    if (!result.success) {
      console.error(`[API Schema] Transaction ${i} validation failed:`, {
        errors: result.error.issues,
        receivedData: JSON.stringify(data[i], null, 2).substring(0, 500),
      });
      // Continue with other transactions instead of failing completely
    } else {
      parsed.push(result.data);
    }
  }

  return parsed;
}

