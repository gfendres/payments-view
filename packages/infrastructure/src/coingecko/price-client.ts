import { API_CONFIG } from '@payments-view/constants';

import { CoinGeckoClient } from './client';
import { type CoinGeckoPriceResponse, parseCoinGeckoPriceResponse } from './schemas';
import type { ApiResult } from '../http/types';

/**
 * CoinGecko price client
 */
export class CoinGeckoPriceClient {
  private readonly client: CoinGeckoClient;

  constructor(client?: CoinGeckoClient, apiKey?: string) {
    this.client = client ?? new CoinGeckoClient(undefined, apiKey);
  }

  /**
   * Get token price(s) by ID(s)
   * Docs: https://docs.coingecko.com/reference/simple-price
   *
   * @param tokenIds - Comma-separated list of token IDs (e.g., "gnosis,bitcoin")
   * @param currencies - Comma-separated list of currencies (e.g., "usd,eur")
   * @param include24hChange - Include 24h price change
   * @param includeMarketCap - Include market cap
   */
  async getPrice(params: {
    tokenIds: string;
    currencies: string;
    include24hChange?: boolean;
    includeMarketCap?: boolean;
  }): Promise<ApiResult<CoinGeckoPriceResponse>> {
    const searchParams = new URLSearchParams({
      ids: params.tokenIds,
      vs_currencies: params.currencies,
    });

    if (params.include24hChange) {
      searchParams.append('include_24hr_change', 'true');
    }

    if (params.includeMarketCap) {
      searchParams.append('include_market_cap', 'true');
    }

    // Always include last_updated_at for cache validation
    searchParams.append('include_last_updated_at', 'true');

    const endpoint = `${API_CONFIG.COINGECKO.ENDPOINTS.SIMPLE_PRICE}?${searchParams.toString()}`;

    const result = await this.client.request<CoinGeckoPriceResponse>(endpoint);

    if (!result.success) {
      return result;
    }

    // Validate the response with Zod schema
    const validated = parseCoinGeckoPriceResponse(result.data);

    if (!validated) {
      return {
        success: false,
        error: {
          error: 'INVALID_RESPONSE',
          message: 'Failed to validate CoinGecko price response',
        },
      };
    }

    return { success: true, data: validated };
  }
}
