'use client';

import { useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { CATEGORIES, CategoryId } from '@payments-view/constants';
import { Button } from '@payments-view/ui';

import type { SerializedTransaction } from './transaction-row';

/**
 * Time period options for filtering
 */
type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

const TIME_PERIODS: Array<{ value: TimePeriod; label: string }> = [
  { value: 'week', label: '7D' },
  { value: 'month', label: '30D' },
  { value: 'quarter', label: '90D' },
  { value: 'year', label: '1Y' },
  { value: 'all', label: 'All' },
];

interface SpendingChartProps {
  transactions: SerializedTransaction[];
  className?: string;
}

interface CategorySpending {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

/**
 * Get date threshold for time period
 */
function getDateThreshold(period: TimePeriod): Date | undefined {
  if (period === 'all') return undefined;

  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'quarter':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return undefined;
  }
}

/**
 * Filter transactions by time period
 */
function filterByTimePeriod(
  transactions: SerializedTransaction[],
  period: TimePeriod
): SerializedTransaction[] {
  const threshold = getDateThreshold(period);
  if (!threshold) return transactions;

  return transactions.filter((tx) => {
    const txDate = new Date(tx.createdAt);
    return txDate >= threshold;
  });
}

/**
 * Aggregate spending by category
 */
function aggregateByCategory(transactions: SerializedTransaction[]): CategorySpending[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  // Only count spending (not refunds/reversals)
  const spendingTx = transactions.filter(
    (tx) => tx.billingAmount.amount < 0 || tx.kind === 'Payment'
  );

  // Aggregate by category name
  for (const tx of spendingTx) {
    const categoryName = tx.merchant.category;
    const existing = categoryMap.get(categoryName) ?? { amount: 0, count: 0 };
    categoryMap.set(categoryName, {
      amount: existing.amount + Math.abs(tx.billingAmount.amount),
      count: existing.count + 1,
    });
  }

  // Calculate total for percentages
  let total = 0;
  for (const { amount } of categoryMap.values()) {
    total += amount;
  }

  // Map to CategorySpending array - add defensive check
  const categories = CATEGORIES ? Object.values(CATEGORIES) : [];
  const result: CategorySpending[] = [];

  for (const category of categories) {
    const data = categoryMap.get(category.name);
    if (data && data.amount > 0) {
      result.push({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      });
    }
  }

  // Sort by amount descending
  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategorySpending }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium">{data.name}</span>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-medium">
            €{data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Transactions:</span>
          <span className="font-medium">{data.count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Percentage:</span>
          <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom legend component
 */
function CustomLegend({ categories }: { categories: CategorySpending[] }) {
  const topCategories = categories.slice(0, 5);
  const othersCount = categories.length - 5;

  return (
    <div className="mt-4 space-y-2">
      {topCategories.map((category) => (
        <div key={category.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-muted-foreground">{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              €{category.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-muted-foreground">
              ({category.percentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      ))}
      {othersCount > 0 && (
        <div className="text-xs text-muted-foreground">
          +{othersCount} more categories
        </div>
      )}
    </div>
  );
}

/**
 * Time period selector component
 */
function TimePeriodSelector({
  value,
  onChange,
}: {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {TIME_PERIODS.map((period) => (
        <Button
          key={period.value}
          type="button"
          variant={value === period.value ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Spending by category chart component
 */
export function SpendingChart({ transactions, className }: SpendingChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
  }, []);

  const filteredTransactions = useMemo(
    () => filterByTimePeriod(transactions, timePeriod),
    [transactions, timePeriod]
  );

  const categoryData = useMemo(
    () => aggregateByCategory(filteredTransactions),
    [filteredTransactions]
  );

  const totalSpending = useMemo(
    () => categoryData.reduce((sum, cat) => sum + cat.amount, 0),
    [categoryData]
  );

  if (categoryData.length === 0) {
    return (
      <div className={`flex flex-col ${className ?? ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Spending by Category</h3>
          <TimePeriodSelector value={timePeriod} onChange={handlePeriodChange} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No spending data for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Spending by Category</h3>
        <TimePeriodSelector value={timePeriod} onChange={handlePeriodChange} />
      </div>

      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">Total Spending</p>
        <p className="text-3xl font-bold">
          €{totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">
          {filteredTransactions.length} transactions
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData as unknown as Array<Record<string, unknown>>}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="amount"
              nameKey="name"
            >
              {categoryData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  stroke="transparent"
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend categories={categoryData} />
    </div>
  );
}
