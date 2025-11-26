'use client';

import { Wallet, Coins, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@payments-view/ui';

import type { SerializedRewards } from '../hooks';

interface CashbackSummaryProps {
  rewards: SerializedRewards;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
}

/**
 * Individual stat card component
 */
function StatCard({ title, value, subtitle, icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-xl bg-muted p-3 ${iconColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Cashback Summary component
 * Displays overview of cashback earnings and stats
 */
export function CashbackSummary({ rewards, className }: CashbackSummaryProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Cashback Overview</h2>
        <p className="text-muted-foreground">Your rewards at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cashback Earned</p>
                <p className="mt-1 text-4xl font-bold text-emerald-500">
                  {rewards.totalEarned.formatted}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lifetime earnings from all transactions
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/20 p-4 text-emerald-500">
                <Coins className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <StatCard
          title="Earned This Month"
          value={rewards.earnedThisMonth.formatted}
          subtitle={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="text-blue-500"
        />

        {/* Current Rate */}
        <StatCard
          title="Current Rate"
          value={`${rewards.currentRate}%`}
          subtitle={`${rewards.baseRate}% base${rewards.isOgHolder ? ' + 1% OG' : ''}`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-violet-500"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* GNO Balance */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-xl bg-amber-500/20 p-3 text-amber-500">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GNO Balance</p>
              <p className="text-lg font-bold">
                {rewards.gnoBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eligible Transactions */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-500">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eligible Transactions</p>
              <p className="text-lg font-bold">{rewards.eligibleTransactionCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tier Status */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-xl bg-violet-500/20 p-3 text-violet-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-lg font-bold">{rewards.tierLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

