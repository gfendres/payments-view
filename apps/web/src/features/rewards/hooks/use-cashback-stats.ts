'use client';

import { useMemo } from 'react';

import { calculateCashbackStats } from '../lib';
import type { CashbackStats } from '../lib';
import type { SerializedTransaction } from '@/features/transactions';

interface UseCashbackStatsOptions {
  transactions: SerializedTransaction[];
  cashbackRate: number;
  enabled?: boolean;
}

/**
 * Hook to calculate cashback statistics from transactions
 * 
 * This hook accepts pre-fetched transactions (filtered or unfiltered)
 * and computes comprehensive cashback stats including earnings, projections,
 * and eligible transaction counts.
 * 
 * @param options.transactions - Array of transactions to calculate stats from
 * @param options.cashbackRate - Current cashback rate as a percentage (e.g., 3.84)
 * @param options.enabled - Whether to calculate stats (defaults to true)
 * @returns Object containing calculated cashback statistics
 */
export function useCashbackStats(options: UseCashbackStatsOptions) {
  const { transactions, cashbackRate, enabled = true } = options;

  const stats = useMemo<CashbackStats | undefined>(() => {
    if (!enabled || !transactions || transactions.length === 0) {
      return undefined;
    }

    return calculateCashbackStats(transactions, cashbackRate);
  }, [transactions, cashbackRate, enabled]);

  return { stats };
}

