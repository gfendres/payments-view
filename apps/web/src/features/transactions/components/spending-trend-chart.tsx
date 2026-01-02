'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Button } from '@payments-view/ui';
import { isSuccessStatus } from '@payments-view/constants';

import type { SerializedTransaction } from './transaction-row';

type TimePeriod = 'weekly' | 'monthly';

interface SpendingTrendChartProps {
  transactions: SerializedTransaction[];
  className?: string;
}

interface DataPoint {
  label: string;
  amount: number;
  count: number;
  date: Date;
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get month start date
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Format date label based on period
 */
function formatLabel(date: Date, period: TimePeriod): string {
  if (period === 'weekly') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Aggregate transactions by time period
 */
function aggregateByPeriod(
  transactions: SerializedTransaction[],
  period: TimePeriod
): DataPoint[] {
  const getPeriodKey = period === 'weekly' ? getWeekStart : getMonthStart;
  const groups = new Map<string, { amount: number; count: number; date: Date }>();

  // Filter for spending transactions with successful status only
  const spendingTx = transactions.filter(
    (tx) =>
      isSuccessStatus(tx.status) && (tx.billingAmount.amount < 0 || tx.kind === 'Payment')
  );

  for (const tx of spendingTx) {
    const date = new Date(tx.createdAt);
    const periodStart = getPeriodKey(date);
    const key = periodStart.toISOString();

    const existing = groups.get(key) ?? { amount: 0, count: 0, date: periodStart };
    groups.set(key, {
      amount: existing.amount + Math.abs(tx.billingAmount.amount),
      count: existing.count + 1,
      date: periodStart,
    });
  }

  // Sort by date and convert to array
  const sorted = Array.from(groups.entries())
    .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
    .map(([, data]) => ({
      label: formatLabel(data.date, period),
      amount: data.amount,
      count: data.count,
      date: data.date,
    }));

  return sorted;
}

/**
 * Calculate trend percentage
 */
function calculateTrend(data: DataPoint[]): { value: number; direction: 'up' | 'down' | 'stable' } {
  if (data.length < 2) return { value: 0, direction: 'stable' };

  const current = data[data.length - 1]?.amount ?? 0;
  const previous = data[data.length - 2]?.amount ?? 0;

  if (previous === 0) return { value: 0, direction: 'stable' };

  const change = ((current - previous) / previous) * 100;

  if (Math.abs(change) < 1) return { value: 0, direction: 'stable' };
  return { value: Math.abs(change), direction: change > 0 ? 'up' : 'down' };
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
  payload?: Array<{ payload: DataPoint }>;
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
          <span className="text-muted-foreground">Spending:</span>
          <span className="font-medium">
            €{data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
 * Trend indicator component
 */
function TrendIndicator({ trend }: { trend: { value: number; direction: 'up' | 'down' | 'stable' } }) {
  if (trend.direction === 'stable') {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm">No change</span>
      </div>
    );
  }

  const isUp = trend.direction === 'up';

  return (
    <div className={`flex items-center gap-1 ${isUp ? 'text-destructive' : 'text-emerald-500'}`}>
      {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {trend.value.toFixed(1)}% {isUp ? 'increase' : 'decrease'}
      </span>
    </div>
  );
}

/**
 * Spending trend chart component
 */
export function SpendingTrendChart({ transactions, className }: SpendingTrendChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('weekly');

  const handlePeriodChange = useCallback((newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
  }, []);

  const data = useMemo(() => aggregateByPeriod(transactions, period), [transactions, period]);
  const trend = useMemo(() => calculateTrend(data), [data]);
  const totalSpending = useMemo(() => data.reduce((sum, d) => sum + d.amount, 0), [data]);

  if (data.length === 0) {
    return (
      <div className={`flex flex-col ${className ?? ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Spending Over Time</h3>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={period === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handlePeriodChange('weekly')}
            >
              Weekly
            </Button>
            <Button
              type="button"
              variant={period === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handlePeriodChange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Spending Over Time</h3>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={period === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handlePeriodChange('weekly')}
          >
            Weekly
          </Button>
          <Button
            type="button"
            variant={period === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handlePeriodChange('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold">
            €{totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            Total spending ({data.length} {period === 'weekly' ? 'weeks' : 'months'})
          </p>
        </div>
        <TrendIndicator trend={trend} />
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `€${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#spendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

