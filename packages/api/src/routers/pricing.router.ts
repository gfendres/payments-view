import { z } from 'zod';
import { CurrencyCode, API_CONFIG } from '@payments-view/constants';
import { GetTokenPriceUseCase } from '@payments-view/application/use-cases';
import { CoinGeckoTokenPriceRepository } from '@payments-view/infrastructure/coingecko';

import { router, publicProcedure, handleDomainError } from '../trpc';

/**
 * Input schema for getting token price
 */
const getTokenPriceSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required').default(API_CONFIG.COINGECKO.TOKEN_IDS.GNOSIS),
  currency: z.nativeEnum(CurrencyCode).default(CurrencyCode.EUR),
});

/**
 * Pricing tRPC router
 */
export const pricingRouter = router({
  /**
   * Get token price
   */
  getTokenPrice: publicProcedure
    .input(getTokenPriceSchema)
    .query(async ({ input }) => {
      // Optional: Get CoinGecko API key from environment for higher rate limits
      // Free tier works without it, but Pro API provides better rate limits
      const apiKey = process.env['COINGECKO_API_KEY'];
      const repository = new CoinGeckoTokenPriceRepository(undefined, apiKey);
      const useCase = new GetTokenPriceUseCase(repository);

      const result = await useCase.execute({
        tokenId: input.tokenId,
        currency: input.currency,
      });

      if (result.isFailure) {
        throw handleDomainError(result.error);
      }

      const tokenPrice = result.value;

      // Return serializable format
      return {
        tokenId: tokenPrice.tokenId,
        price: tokenPrice.price,
        currency: tokenPrice.currency,
        lastUpdatedAt: tokenPrice.lastUpdatedAt.toISOString(),
        change24h: tokenPrice.change24h,
        marketCap: tokenPrice.marketCap,
      };
    }),
});

export type PricingRouter = typeof pricingRouter;
