'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES, CategoryId } from '@payments-view/constants';

import type { SerializedTransaction } from './transaction-row';

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

  // Map to CategorySpending array
  const categories = Object.values(CATEGORIES);
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
        <span className="text-xl">{data.icon}</span>
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
 * Spending by category chart component
 */
export function SpendingChart({ transactions, className }: SpendingChartProps) {
  const categoryData = useMemo(() => aggregateByCategory(transactions), [transactions]);

  const totalSpending = useMemo(
    () => categoryData.reduce((sum, cat) => sum + cat.amount, 0),
    [categoryData]
  );

  if (categoryData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className ?? ''}`}>
        <div className="mb-3 text-4xl opacity-50">📊</div>
        <p className="text-sm text-muted-foreground">No spending data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">Total Spending</p>
        <p className="text-3xl font-bold">
          €{totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

