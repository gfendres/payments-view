'use client';

import { Wallet, Coins, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@payments-view/ui';

import { StatCard } from '@/components/molecules';
import type { SerializedRewards } from '../hooks';

/**
 * Calculated cashback stats from transactions
 */
export interface CashbackStats {
  totalEarned: number;
  earnedThisMonth: number;
  earnedLastMonth: number;
  eligibleThisMonth: number;
  eligibleLastMonth: number;
  totalEligible: number;
}

interface CashbackSummaryProps {
  rewards: SerializedRewards;
  stats?: CashbackStats;
  className?: string;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Cashback Summary component
 * Displays overview of cashback earnings and stats
 */
export function CashbackSummary({ rewards, stats, className }: CashbackSummaryProps) {
  // Use calculated stats if provided, otherwise use API values
  const totalEarned = stats?.totalEarned ?? rewards.totalEarned.amount;
  const earnedThisMonth = stats?.earnedThisMonth ?? rewards.earnedThisMonth.amount;
  const earnedLastMonth = stats?.earnedLastMonth ?? 0;
  const eligibleCount = stats?.totalEligible ?? rewards.eligibleTransactionCount;
  const eligibleThisMonth = stats?.eligibleThisMonth ?? 0;
  const eligibleLastMonth = stats?.eligibleLastMonth ?? 0;
  const projectedYearlyCashback = earnedThisMonth * 12;

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Cashback Overview</h2>
        <p className="text-muted-foreground">Your rewards at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings - Featured */}
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Cashback Earned</p>
                <p className="mt-1 text-4xl font-bold text-emerald-500">
                  {formatCurrency(totalEarned)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Lifetime earnings from all transactions
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-emerald-500/20 p-4 text-emerald-500">
                <Coins className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <StatCard
          title="Earned This Month"
          value={formatCurrency(earnedThisMonth)}
          subtitle={`Projected: ${formatCurrency(projectedYearlyCashback)} / year`}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="blue"
          trend={
            earnedLastMonth > 0 || earnedThisMonth > 0
              ? {
                  value: earnedThisMonth,
                  previousValue: earnedLastMonth,
                  period: 'last month',
                }
              : undefined
          }
        />

        {/* Current Rate */}
        <StatCard
          title="Current Rate"
          value={`${rewards.currentRate}%`}
          subtitle={`${rewards.baseRate}% base${rewards.isOgHolder ? ' + 1% OG' : ''}`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="violet"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          layout="horizontal"
          title="GNO Balance"
          value={rewards.gnoBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<Wallet className="h-5 w-5" />}
          iconColor="amber"
        />

        <StatCard
          layout="horizontal"
          title="Eligible Transactions"
          value={eligibleCount}
          icon={<Receipt className="h-5 w-5" />}
          iconColor="cyan"
          trend={
            eligibleLastMonth > 0 || eligibleThisMonth > 0
              ? {
                  value: eligibleThisMonth,
                  previousValue: eligibleLastMonth,
                  period: 'last month',
                }
              : undefined
          }
        />

        <StatCard
          layout="horizontal"
          title="Current Tier"
          value={rewards.tierLabel}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="violet"
        />
      </div>
    </div>
  );
}
