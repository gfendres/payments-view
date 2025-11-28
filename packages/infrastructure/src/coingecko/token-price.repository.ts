import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError } from '@payments-view/domain/shared';
import type { CurrencyCode } from '@payments-view/constants';
import type { ITokenPriceRepository, TokenPrice } from '@payments-view/domain/pricing';

import { CoinGeckoPriceClient } from './price-client';
import { mapCoinGeckoPriceToTokenPrice } from './mappers';

/**
 * CoinGecko token price repository implementation
 */
export class CoinGeckoTokenPriceRepository implements ITokenPriceRepository {
  private readonly priceClient: CoinGeckoPriceClient;

  constructor(priceClient?: CoinGeckoPriceClient, apiKey?: string) {
    this.priceClient = priceClient ?? new CoinGeckoPriceClient(undefined, apiKey);
  }

  /**
   * Get token price in specified currency
   */
  async getTokenPrice(
    tokenId: string,
    currency: CurrencyCode
  ): Promise<Result<TokenPrice, ExternalServiceError>> {
    const currencyLower = currency.toLowerCase();

    const result = await this.priceClient.getPrice({
      tokenIds: tokenId,
      currencies: currencyLower,
      include24hChange: true,
      includeMarketCap: true,
    });

    if (!result.success) {
      return Result.err(
        new ExternalServiceError(
          'CoinGecko',
          result.error.message ?? 'Failed to fetch token price'
        )
      );
    }

    // Extract price data for the requested token
    const tokenPriceData = result.data[tokenId];

    if (!tokenPriceData) {
      return Result.err(
        new ExternalServiceError(
          'CoinGecko',
          `Token '${tokenId}' not found in response`
        )
      );
    }

    // Map to domain entity
    const tokenPrice = mapCoinGeckoPriceToTokenPrice(tokenId, tokenPriceData, currency);

    if (!tokenPrice) {
      return Result.err(
        new ExternalServiceError(
          'CoinGecko',
          `Price for currency '${currency}' not available`
        )
      );
    }

    return Result.ok(tokenPrice);
  }
}
