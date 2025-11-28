import type { CurrencyCode } from '@payments-view/constants';
import { TokenPrice } from '@payments-view/domain/pricing';
import type { CoinGeckoPriceData } from '../schemas';

/**
 * Map CoinGecko price data to domain TokenPrice
 */
export function mapCoinGeckoPriceToTokenPrice(
  tokenId: string,
  priceData: CoinGeckoPriceData,
  currency: CurrencyCode
): TokenPrice | null {
  // Get price in requested currency
  const price = getPriceForCurrency(priceData, currency);

  if (price === null) {
    return null;
  }

  // Get last updated timestamp
  const lastUpdatedAt = priceData.last_updated_at
    ? new Date(priceData.last_updated_at * 1000) // CoinGecko uses Unix timestamp in seconds
    : new Date();

  return TokenPrice.create({
    tokenId,
    price,
    currency,
    lastUpdatedAt,
    change24h: priceData.usd_24h_change ?? null,
    marketCap: priceData.usd_market_cap ?? null,
  });
}

/**
 * Extract price for a specific currency from CoinGecko response
 */
function getPriceForCurrency(
  priceData: CoinGeckoPriceData,
  currency: CurrencyCode
): number | null {
  const currencyLower = currency.toLowerCase();

  // Check for exact match first
  if (currencyLower === 'usd' && priceData.usd !== undefined) {
    return priceData.usd;
  }

  if (currencyLower === 'eur' && priceData.eur !== undefined) {
    return priceData.eur;
  }

  if (currencyLower === 'gbp' && priceData.gbp !== undefined) {
    return priceData.gbp;
  }

  // Check if currency exists as a key (for other currencies)
  const price = priceData[currencyLower as keyof CoinGeckoPriceData];
  if (typeof price === 'number') {
    return price;
  }

  return null;
}
