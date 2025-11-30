import { useMemo } from 'react';
import { CurrencyCode, API_CONFIG } from '@payments-view/constants';
import { trpc } from '@/lib/trpc/client';

export interface UseTokenPriceOptions {
  tokenId?: string;
  currency?: CurrencyCode;
  enabled?: boolean;
}

/**
 * Hook to fetch token price from CoinGecko
 */
export function useTokenPrice(options: UseTokenPriceOptions = {}) {
  const {
    tokenId = API_CONFIG.COINGECKO.TOKEN_IDS.GNOSIS,
    currency = CurrencyCode.EUR,
    enabled = true,
  } = options;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = trpc.pricing.getTokenPrice.useQuery(
    {
      tokenId,
      currency,
    },
    {
      enabled,
      staleTime: 60_000, // 1 minute - prices update every ~20 seconds on CoinGecko
      refetchOnWindowFocus: false,
    }
  );

  const error = useMemo(() => {
    if (queryError) {
      return queryError.message || 'Failed to fetch token price';
    }
    return null;
  }, [queryError]);

  return {
    price: data?.price ?? null,
    currency: data?.currency ?? currency,
    tokenId: data?.tokenId ?? tokenId,
    lastUpdatedAt: data?.lastUpdatedAt ? new Date(data.lastUpdatedAt) : null,
    change24h: data?.change24h ?? null,
    marketCap: data?.marketCap ?? null,
    isLoading,
    error,
    refetch,
  };
}


