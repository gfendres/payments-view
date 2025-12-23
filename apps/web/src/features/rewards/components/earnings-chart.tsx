'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@payments-view/ui';

import type { SerializedTransaction } from '@/features/transactions';

interface EarningsChartProps {
  transactions: SerializedTransaction[];
  cashbackRate: number;
  className?: string;
}

interface MonthlyData {
  label: string;
  month: string;
  year: number;
  earnings: number;
  spending: number;
  count: number;
  date: Date;
}

/**
 * Get month start date
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Format month label
 */
function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Aggregate eligible transactions by month and calculate cashback earnings
 */
function aggregateEarningsByMonth(
  transactions: SerializedTransaction[],
  cashbackRate: number
): MonthlyData[] {
  const rate = cashbackRate / 100;
  const groups = new Map<string, MonthlyData>();

  // Filter for cashback-eligible transactions
  const eligibleTx = transactions.filter((tx) => tx.isEligibleForCashback);

  for (const tx of eligibleTx) {
    const date = new Date(tx.createdAt);
    const monthStart = getMonthStart(date);
    const key = monthStart.toISOString();

    const spending = Math.abs(tx.billingAmount.amount);
    const earnings = spending * rate;

    const existing = groups.get(key);
    if (existing) {
      existing.earnings += earnings;
      existing.spending += spending;
      existing.count += 1;
    } else {
      groups.set(key, {
        label: formatMonthLabel(monthStart),
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        year: monthStart.getFullYear(),
        earnings,
        spending,
        count: 1,
        date: monthStart,
      });
    }
  }

  // Sort by date and return last 12 months max
  const sorted = Array.from(groups.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-12);

  return sorted;
}

/**
 * Calculate the average earnings from the data
 */
function calculateAverage(data: MonthlyData[]): number {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, d) => sum + d.earnings, 0);
  return total / data.length;
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyData }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-2 font-medium">{label}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Cashback:</span>
          <span className="font-medium text-emerald-500">
            €{data.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Spending:</span>
          <span className="font-medium">
            €{data.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Transactions:</span>
          <span className="font-medium">{data.count}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">No earnings data available yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Start using your card to see cashback earnings
      </p>
    </div>
  );
}

/**
 * Earnings over time chart component
 * Shows monthly cashback earnings with an average reference line
 */
export function EarningsChart({ transactions, cashbackRate, className }: EarningsChartProps) {
  const data = useMemo(
    () => aggregateEarningsByMonth(transactions, cashbackRate),
    [transactions, cashbackRate]
  );

  const averageEarnings = useMemo(() => calculateAverage(data), [data]);
  const totalEarnings = useMemo(() => data.reduce((sum, d) => sum + d.earnings, 0), [data]);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span>Earnings Over Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <span>Earnings Over Time</span>
            <div className="text-muted-foreground text-xs font-normal mt-0.5">
              Monthly cashback from eligible transactions
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold text-emerald-500">
              €{totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total earnings ({data.length} {data.length === 1 ? 'month' : 'months'})
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              €{averageEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(16 185 129)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(16 185 129)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `€${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Average reference line */}
              <ReferenceLine
                y={averageEarnings}
                stroke="rgb(251 191 36)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Avg: €${averageEarnings.toFixed(2)}`,
                  position: 'right',
                  fill: 'rgb(251 191 36)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="rgb(16 185 129)"
                strokeWidth={2}
                fill="url(#earningsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Monthly Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-amber-400" />
            <span className="text-muted-foreground">Average</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





