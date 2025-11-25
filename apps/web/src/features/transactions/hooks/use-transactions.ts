'use client';

import { trpc } from '@/lib/trpc';

import type { SerializedTransaction } from '../components/transaction-row';

/**
 * Transaction query options
 */
export interface UseTransactionsOptions {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
  billingCurrency?: string;
  mcc?: string;
  transactionType?: string;
  cardTokens?: string[];
  enabled?: boolean;
}

/**
 * Hook for fetching transactions
 */
export function useTransactions(options: UseTransactionsOptions = {}) {
  const { enabled = true, ...queryParams } = options;

  const query = trpc.transaction.list.useQuery(queryParams, {
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    transactions: (query.data?.transactions ?? []) as SerializedTransaction[],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single transaction
 */
export function useTransaction(transactionId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.transaction.get.useQuery(
    { transactionId },
    {
      enabled: enabled && !!transactionId,
      staleTime: 60 * 1000, // 1 minute
    }
  );

  return {
    transaction: query.data as SerializedTransaction | undefined,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

