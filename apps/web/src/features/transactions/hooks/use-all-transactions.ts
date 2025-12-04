'use client';

import { useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

import type { SerializedTransaction } from '../components/transaction-row';

export interface UseAllTransactionsOptions {
  pageSize?: number;
  before?: string;
  after?: string;
  enabled?: boolean;
}

const MAX_PAGE_SIZE = 100;
const STALE_TIME_MS = 60_000;

export function useAllTransactions(options: UseAllTransactionsOptions = {}) {
  const { pageSize = MAX_PAGE_SIZE, enabled = true, ...filters } = options;
  const effectivePageSize = Math.min(pageSize, MAX_PAGE_SIZE);
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
    queryKey: ['transactions', 'all', { pageSize: effectivePageSize, ...filters }],
    queryFn: async ({ pageParam = 0 }) => {
      return utils.transaction.list.fetch({
        limit: effectivePageSize,
        offset: pageParam,
        ...filters,
      });
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
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const transactions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.transactions) as SerializedTransaction[];
  }, [data?.pages]);

  const total = data?.pages[0]?.total ?? 0;
  const allPagesFetched = !hasNextPage && !isLoading && !isFetchingNextPage;

  return {
    transactions,
    total,
    allPagesFetched,
    isLoading,
    isFetching: isFetching || isFetchingNextPage,
    progress: total > 0 ? transactions.length / total : 0,
    error: error?.message ?? null,
    refetch,
  };
}
