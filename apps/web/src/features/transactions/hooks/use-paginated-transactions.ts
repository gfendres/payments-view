'use client';

import { useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

import type { SerializedTransaction } from '../components/transaction-row';

/**
 * Paginated transaction query options
 */
export interface UsePaginatedTransactionsOptions {
  pageSize?: number;
  before?: string;
  after?: string;
  billingCurrency?: string;
  mcc?: string;
  transactionType?: string;
  cardTokens?: string[];
  enabled?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Hook for fetching transactions with infinite scrolling pagination
 */
export function usePaginatedTransactions(options: UsePaginatedTransactionsOptions = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE, enabled = true, ...filters } = options;

  // Get the tRPC context for raw fetching
  const utils = trpc.useUtils();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['transactions', 'paginated', { pageSize, ...filters }],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await utils.transaction.list.fetch({
        limit: pageSize,
        offset: pageParam,
        ...filters,
      });
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.transactions.length, 0);
      if (lastPage.hasMore && totalFetched < lastPage.total) {
        return totalFetched;
      }
      return undefined;
    },
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array
  const transactions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.transactions) as SerializedTransaction[];
  }, [data?.pages]);

  const total = data?.pages[0]?.total ?? 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    transactions,
    total,
    hasMore: hasNextPage ?? false,
    isLoading,
    isFetching,
    isFetchingMore: isFetchingNextPage,
    error: error?.message ?? null,
    loadMore,
    refetch,
  };
}

