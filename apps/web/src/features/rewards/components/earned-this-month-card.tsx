'use client';

import { Coins } from 'lucide-react';
import { StatCard, Skeleton } from '@payments-view/ui';

import type { CashbackStats } from '../lib';

interface EarnedThisMonthCardProps {
  stats?: CashbackStats;
  isLoading?: boolean;
  className?: string;
  /** Whether the stats are based on filtered data */
  isFiltered?: boolean;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/**
 * Earned This Month Card component
 *
 * Displays the cashback earned in the current month with:
 * - Trend comparison to last month
 * - Projected yearly earnings based on 6-month average
 *
 * Used in both Dashboard and Rewards pages for consistent display.
 */
export function EarnedThisMonthCard({ stats, isLoading, className, isFiltered }: EarnedThisMonthCardProps) {
  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  const title = isFiltered ? 'Cashback Earned' : 'Earned This Month';
  const subtitle = isFiltered
    ? 'From filtered transactions'
    : `Projected: ${formatCurrency(stats?.projectedYearlyCashback ?? 0)} / year`;

  // When filtered, show total earned from all filtered transactions
  // When not filtered, show just this month's earnings
  const value = isFiltered ? stats?.totalEarned ?? 0 : stats?.earnedThisMonth ?? 0;

  if (!stats) {
    return (
      <StatCard
        title={title}
        value="€0.00"
        icon={<Coins className="h-5 w-5" />}
        iconColor="emerald"
        valueColor="success"
        subtitle="No eligible transactions yet"
        className={className}
      />
    );
  }

  return (
    <StatCard
      title={title}
      value={formatCurrency(value)}
      icon={<Coins className="h-5 w-5" />}
      iconColor="emerald"
      valueColor="success"
      subtitle={subtitle}
      trend={
        !isFiltered ? {
          value: stats.earnedThisMonth,
          previousValue: stats.earnedLastMonth,
          period: 'last month',
        } : undefined
      }
      className={className}
    />
  );
}

