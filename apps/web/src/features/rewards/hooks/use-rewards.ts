'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Serialized rewards info from API
 */
export interface SerializedRewards {
  gnoBalance: number;
  isOgHolder: boolean;
  tierLabel: string;
  currentRate: number;
  baseRate: number;
  totalEarned: {
    amount: number;
    currency: string;
    formatted: string;
  };
  earnedThisMonth: {
    amount: number;
    currency: string;
    formatted: string;
  };
  eligibleTransactionCount: number;
  tier: {
    current: number;
    label: string;
    minGno: number;
    maxGno: number | null;
    isMaxTier: boolean;
    progressToNextTier: number;
    gnoNeededForNextTier: number;
    nextTierRate: number;
    ogBonusRate: number;
  };
}

interface UseRewardsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch and manage rewards data
 */
export function useRewards(options: UseRewardsOptions = {}) {
  const { enabled = true } = options;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = trpc.rewards.get.useQuery(undefined, {
    enabled,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const error = useMemo(() => {
    if (queryError) {
      return queryError.message || 'Failed to fetch rewards';
    }
    return null;
  }, [queryError]);

  return {
    rewards: data ?? null,
    isLoading,
    error,
    refetch,
  };
}

