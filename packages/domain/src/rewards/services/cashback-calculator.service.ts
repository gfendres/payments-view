import {
  CASHBACK_TIER_CONFIG,
  type CashbackTier as CashbackTierEnum,
  FORMAT_CONFIG,
  getTotalCashbackRate,
} from '@payments-view/constants';

import type { CashbackTierInfo } from '../value-objects/cashback-tier';

/**
 * Transaction data needed for cashback calculation
 */
export interface CashbackEligibleTransaction {
  id: string;
  billingAmount: number;
  isEligibleForCashback: boolean;
  createdAt: Date;
}

/**
 * Cashback calculation result for a single transaction
 */
export interface TransactionCashback {
  transactionId: string;
  billingAmount: number;
  cashbackRate: number;
  cashbackAmount: number;
}

/**
 * Summary of cashback earnings
 */
export interface CashbackSummary {
  totalSpending: number;
  eligibleSpending: number;
  totalCashback: number;
  transactionCount: number;
  eligibleTransactionCount: number;
  averageCashbackRate: number;
}

/**
 * Tier progress information
 */
export interface TierProgress {
  currentTier: CashbackTierEnum;
  currentTierLabel: string;
  currentRate: number;
  nextTier: CashbackTierEnum | null;
  nextTierLabel: string | null;
  nextRate: number | null;
  gnoBalance: number;
  gnoNeeded: number;
  progressPercentage: number;
  potentialExtraCashback: number;
}

/**
 * Cashback Calculator Service
 * Handles all cashback-related calculations
 */
export class CashbackCalculatorService {
  /**
   * Calculate cashback for a single transaction
   */
  calculateTransactionCashback(
    transaction: CashbackEligibleTransaction,
    tierInfo: CashbackTierInfo
  ): TransactionCashback {
    const billingAmount = Math.abs(transaction.billingAmount);
    const cashbackRate = transaction.isEligibleForCashback ? tierInfo.totalRate : 0;
    const cashbackAmount = billingAmount * (cashbackRate / FORMAT_CONFIG.PERCENTAGE.FULL);

    return {
      transactionId: transaction.id,
      billingAmount,
      cashbackRate,
      cashbackAmount,
    };
  }

  /**
   * Calculate cashback for multiple transactions
   */
  calculateBatchCashback(
    transactions: CashbackEligibleTransaction[],
    tierInfo: CashbackTierInfo
  ): TransactionCashback[] {
    return transactions.map((tx) => this.calculateTransactionCashback(tx, tierInfo));
  }

  /**
   * Calculate total cashback earnings summary
   */
  calculateSummary(
    transactions: CashbackEligibleTransaction[],
    tierInfo: CashbackTierInfo
  ): CashbackSummary {
    let totalSpending = 0;
    let eligibleSpending = 0;
    let totalCashback = 0;
    let eligibleTransactionCount = 0;

    for (const tx of transactions) {
      const amount = Math.abs(tx.billingAmount);
      totalSpending += amount;

      if (tx.isEligibleForCashback) {
        eligibleSpending += amount;
        totalCashback += amount * (tierInfo.totalRate / FORMAT_CONFIG.PERCENTAGE.FULL);
        eligibleTransactionCount++;
      }
    }

    const averageCashbackRate =
      eligibleSpending > 0 ? (totalCashback / eligibleSpending) * FORMAT_CONFIG.PERCENTAGE.FULL : 0;

    return {
      totalSpending,
      eligibleSpending,
      totalCashback,
      transactionCount: transactions.length,
      eligibleTransactionCount,
      averageCashbackRate,
    };
  }

  /**
   * Calculate tier progress and potential earnings
   */
  calculateTierProgress(
    tierInfo: CashbackTierInfo,
    monthlySpending: number
  ): TierProgress {
    const currentTier = tierInfo.tier;
    const isMaxTier = tierInfo.isMaxTier;

    // Calculate next tier info
    const nextTier = isMaxTier ? null : ((currentTier + 1) as CashbackTierEnum);
    const nextTierConfig = nextTier !== null ? CASHBACK_TIER_CONFIG[nextTier] : null;
    const nextRate = nextTier !== null ? getTotalCashbackRate(nextTier, tierInfo.isOgHolder) : null;

    // Calculate potential extra cashback if user upgrades to next tier
    let potentialExtraCashback = 0;
    if (nextRate !== null) {
      const rateDifference = nextRate - tierInfo.totalRate;
      potentialExtraCashback = monthlySpending * (rateDifference / FORMAT_CONFIG.PERCENTAGE.FULL);
    }

    return {
      currentTier,
      currentTierLabel: tierInfo.label,
      currentRate: tierInfo.totalRate,
      nextTier,
      nextTierLabel: nextTierConfig?.label ?? null,
      nextRate,
      gnoBalance: tierInfo.gnoBalance,
      gnoNeeded: tierInfo.gnoNeededForNextTier,
      progressPercentage: tierInfo.progressToNextTier,
      potentialExtraCashback,
    };
  }

  /**
   * Calculate cashback by month for a given period
   */
  calculateMonthlyBreakdown(
    transactions: CashbackEligibleTransaction[],
    tierInfo: CashbackTierInfo
  ): Map<string, CashbackSummary> {
    // Group transactions by month
    const monthlyGroups = new Map<string, CashbackEligibleTransaction[]>();

    for (const tx of transactions) {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = monthlyGroups.get(monthKey) ?? [];
      existing.push(tx);
      monthlyGroups.set(monthKey, existing);
    }

    // Calculate summary for each month
    const result = new Map<string, CashbackSummary>();
    for (const [month, txs] of monthlyGroups) {
      result.set(month, this.calculateSummary(txs, tierInfo));
    }

    return result;
  }
}
