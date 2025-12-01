import type { SerializedTransaction } from '@/features/transactions';

/**
 * Number of months to use for calculating the average
 */
const AVERAGE_MONTHS_COUNT = 6;

/**
 * Calculated cashback stats from transactions
 */
export interface CashbackStats {
  totalEarned: number;
  earnedThisMonth: number;
  earnedLastMonth: number;
  /** Average monthly earnings over the past 6 months */
  averageMonthlyEarned: number;
  /** Projected yearly earnings based on 6-month average */
  projectedYearlyCashback: number;
  eligibleThisMonth: number;
  eligibleLastMonth: number;
  totalEligible: number;
}

/**
 * Get the start of a month for a given date
 */
function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

/**
 * Get the end of a month for a given date
 */
function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

/**
 * Calculate earnings for a specific month
 */
function calculateMonthEarnings(
  transactions: SerializedTransaction[],
  year: number,
  month: number,
  rate: number
): number {
  const monthStart = getMonthStart(year, month);
  const monthEnd = getMonthEnd(year, month);

  const monthlyEligible = transactions.filter((tx) => {
    if (!tx.isEligibleForCashback) return false;
    const date = new Date(tx.createdAt);
    return date >= monthStart && date <= monthEnd;
  });

  return monthlyEligible.reduce((sum, tx) => sum + Math.abs(tx.billingAmount.amount) * rate, 0);
}

/**
 * Calculate the average monthly cashback over the past N months
 * Uses the full month data for completed months and partial data for current month
 */
function calculateAverageMonthlyEarnings(
  transactions: SerializedTransaction[],
  rate: number
): { averageMonthly: number; monthlyEarnings: number[] } {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyEarnings: number[] = [];

  // Calculate earnings for the past N months (including current month)
  for (let i = 0; i < AVERAGE_MONTHS_COUNT; i++) {
    let month = currentMonth - i;
    let year = currentYear;

    // Handle year boundary
    while (month < 0) {
      month += 12;
      year -= 1;
    }

    const earnings = calculateMonthEarnings(transactions, year, month, rate);
    monthlyEarnings.push(earnings);
  }

  // Calculate average (only include months that have data or are complete)
  // For a fairer average, we count all months but could also filter zero months
  const totalEarnings = monthlyEarnings.reduce((sum, e) => sum + e, 0);
  const monthsWithData = monthlyEarnings.filter((e) => e > 0).length;

  // If we have at least one month with data, use that for the average
  // Otherwise fall back to 0
  const averageMonthly = monthsWithData > 0 ? totalEarnings / monthsWithData : 0;

  return { averageMonthly, monthlyEarnings };
}

/**
 * Calculate comprehensive cashback stats from transactions
 *
 * Uses a 6-month rolling average for yearly projections instead of
 * simply multiplying the current month by 12, providing more stable
 * and realistic projections.
 */
export function calculateCashbackStats(
  transactions: SerializedTransaction[],
  cashbackRate: number
): CashbackStats {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  // Filter eligible transactions
  const eligible = transactions.filter((tx) => tx.isEligibleForCashback);

  // This month's eligible
  const eligibleThisMonth = eligible.filter((tx) => {
    const date = new Date(tx.createdAt);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  // Last month's eligible
  const eligibleLastMonth = eligible.filter((tx) => {
    const date = new Date(tx.createdAt);
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  });

  // Calculate spending amounts (absolute values)
  const spendingThisMonth = eligibleThisMonth.reduce(
    (sum, tx) => sum + Math.abs(tx.billingAmount.amount),
    0
  );
  const spendingLastMonth = eligibleLastMonth.reduce(
    (sum, tx) => sum + Math.abs(tx.billingAmount.amount),
    0
  );
  const totalSpending = eligible.reduce((sum, tx) => sum + Math.abs(tx.billingAmount.amount), 0);

  // Convert rate from percentage to decimal
  const rate = cashbackRate / 100;

  // Calculate earnings
  const earnedThisMonth = spendingThisMonth * rate;
  const earnedLastMonth = spendingLastMonth * rate;
  const totalEarned = totalSpending * rate;

  // Calculate 6-month average for projections
  const { averageMonthly } = calculateAverageMonthlyEarnings(transactions, rate);

  return {
    totalEarned,
    earnedThisMonth,
    earnedLastMonth,
    averageMonthlyEarned: averageMonthly,
    projectedYearlyCashback: averageMonthly * 12,
    eligibleThisMonth: eligibleThisMonth.length,
    eligibleLastMonth: eligibleLastMonth.length,
    totalEligible: eligible.length,
  };
}

/**
 * Calculate dashboard stats from transactions
 * Used on the main dashboard page for quick stats overview
 */
export function calculateDashboardCashbackStats(
  transactions: SerializedTransaction[],
  cashbackRate: number
): {
  earnedThisMonth: number;
  earnedLastMonth: number;
  averageMonthlyEarned: number;
  projectedYearlyCashback: number;
  cashbackEligibleCount: number;
  prevCashbackEligibleCount: number;
} {
  const stats = calculateCashbackStats(transactions, cashbackRate * 100); // Convert decimal to percentage

  return {
    earnedThisMonth: stats.earnedThisMonth,
    earnedLastMonth: stats.earnedLastMonth,
    averageMonthlyEarned: stats.averageMonthlyEarned,
    projectedYearlyCashback: stats.projectedYearlyCashback,
    cashbackEligibleCount: stats.eligibleThisMonth,
    prevCashbackEligibleCount: stats.eligibleLastMonth,
  };
}

