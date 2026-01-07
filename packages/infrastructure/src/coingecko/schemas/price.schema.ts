import { z } from 'zod';
import { FORMAT_CONFIG } from '@payments-view/constants';

/**
 * CoinGecko API Price Schemas
 * Based on official docs: https://docs.coingecko.com/reference/simple-price
 * Verified: 2024-12-XX
 *
 * These schemas validate the actual API response format at runtime,
 * helping catch mismatches between our types and the real API.
 */

/**
 * Price data for a single token
 * Docs: https://docs.coingecko.com/reference/simple-price
 */
export const CoinGeckoPriceDataSchema = z.object({
  usd: z.number().optional(),
  eur: z.number().optional(),
  gbp: z.number().optional(),
  usd_market_cap: z.number().optional(),
  usd_24h_vol: z.number().optional(),
  usd_24h_change: z.number().nullable().optional(),
  last_updated_at: z.number().optional(),
}).passthrough(); // Allow extra fields like other currencies

/**
 * CoinGecko simple price response
 * Response format: { "token-id": { "usd": 123.45, ... } }
 */
export const CoinGeckoPriceResponseSchema = z.record(
  z.string(), // token ID (e.g., "gnosis")
  CoinGeckoPriceDataSchema
);

// Export inferred types
export type CoinGeckoPriceData = z.infer<typeof CoinGeckoPriceDataSchema>;
export type CoinGeckoPriceResponse = z.infer<typeof CoinGeckoPriceResponseSchema>;

/**
 * Validate and parse CoinGecko price response with detailed error logging
 */
export function parseCoinGeckoPriceResponse(data: unknown): CoinGeckoPriceResponse | null {
  const result = CoinGeckoPriceResponseSchema.safeParse(data);

  if (!result.success) {
    console.error('[CoinGecko Schema] Price response validation failed:', {
      errors: result.error.issues,
      receivedData: JSON.stringify(data, null, 2).substring(0, FORMAT_CONFIG.STRING_LIMITS.MAX_ERROR_MESSAGE),
    });
    return null;
  }

  return result.data;
}
