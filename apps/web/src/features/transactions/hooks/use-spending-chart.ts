import { useMemo, useState, useCallback } from 'react';
import { CATEGORIES, CategoryId, type CategoryIconName } from '@payments-view/constants';

import type { SerializedTransaction } from '../components/transaction-row';

// ============================================================================
// Types
// ============================================================================

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
export type ViewMode = 'overview' | 'trends';

export interface CategorySpending {
  id: CategoryId;
  name: string;
  icon: CategoryIconName;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface WeeklyData {
  weekLabel: string;
  weekStart: Date;
  total: number;
  [categoryName: string]: string | number | Date;
}

export interface CategoryTrend {
  id: CategoryId;
  name: string;
  color: string;
  monthlyAverage: number;
  currentMonth: number;
  predictedMonth: number;
  changeFromAverage: number;
  direction: 'up' | 'down' | 'stable';
}

export const TIME_PERIODS: Array<{ value: TimePeriod; label: string }> = [
  { value: 'week', label: '7D' },
  { value: 'month', label: '30D' },
  { value: 'quarter', label: '90D' },
  { value: 'year', label: '1Y' },
  { value: 'all', label: 'All' },
];

export const VIEW_MODES: Array<{ value: ViewMode; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'trends', label: 'Trends' },
];

// ============================================================================
// Pure Functions - Date Utilities
// ============================================================================

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
 * Get the Monday of the week for a given date (normalized to midnight)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the first day of the month for a given date
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Format week label for display
 */
function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// Pure Functions - Data Processing
// ============================================================================

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
 * Filter for spending transactions only (exclude refunds/reversals)
 */
function filterSpendingTransactions(
  transactions: SerializedTransaction[]
): SerializedTransaction[] {
  return transactions.filter(
    (tx) => tx.billingAmount.amount < 0 || tx.kind === 'Payment'
  );
}

/**
 * Aggregate spending by category
 */
function aggregateByCategory(transactions: SerializedTransaction[]): CategorySpending[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  const spendingTx = filterSpendingTransactions(transactions);

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
 * Aggregate spending by week and category for historical trends
 */
function aggregateByWeekAndCategory(
  transactions: SerializedTransaction[]
): WeeklyData[] {
  const weekMap = new Map<string, Map<string, number>>();
  const spendingTx = filterSpendingTransactions(transactions);

  // Aggregate by week and category
  for (const tx of spendingTx) {
    const date = new Date(tx.createdAt);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString();
    const categoryName = tx.merchant.category;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, new Map());
    }

    const categoryMap = weekMap.get(weekKey)!;
    const existing = categoryMap.get(categoryName) ?? 0;
    categoryMap.set(categoryName, existing + Math.abs(tx.billingAmount.amount));
  }

  // Convert to array and sort by date
  const result: WeeklyData[] = [];
  const sortedWeeks = Array.from(weekMap.entries()).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  for (const [weekKey, categoryMap] of sortedWeeks) {
    const weekStart = new Date(weekKey);
    const data: WeeklyData = {
      weekLabel: formatWeekLabel(weekStart),
      weekStart,
      total: 0,
    };

    for (const [categoryName, amount] of categoryMap.entries()) {
      data[categoryName] = amount;
      data.total += amount;
    }

    result.push(data);
  }

  return result;
}

/**
 * Calculate monthly spending by category
 */
function aggregateByMonth(
  transactions: SerializedTransaction[]
): Map<string, Map<string, number>> {
  const monthMap = new Map<string, Map<string, number>>();
  const spendingTx = filterSpendingTransactions(transactions);

  for (const tx of spendingTx) {
    const date = new Date(tx.createdAt);
    const monthStart = getMonthStart(date);
    const monthKey = monthStart.toISOString();
    const categoryName = tx.merchant.category;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map());
    }

    const categoryMap = monthMap.get(monthKey)!;
    const existing = categoryMap.get(categoryName) ?? 0;
    categoryMap.set(categoryName, existing + Math.abs(tx.billingAmount.amount));
  }

  return monthMap;
}

/**
 * Calculate trend for each category with monthly averages and predictions
 */
function calculateCategoryTrends(
  transactions: SerializedTransaction[],
  categoryData: CategorySpending[]
): CategoryTrend[] {
  const monthlyData = aggregateByMonth(transactions);
  const now = new Date();
  const currentMonthKey = getMonthStart(now).toISOString();

  // Get all months except current for average calculation
  const pastMonths = Array.from(monthlyData.entries())
    .filter(([key]) => key !== currentMonthKey)
    .sort((a, b) => a[0].localeCompare(b[0]));

  // Calculate days elapsed in current month and total days
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const monthProgress = daysElapsed / daysInMonth;

  return categoryData.map((cat) => {
    // Calculate monthly average from past months
    let totalPastSpending = 0;
    let monthsWithSpending = 0;

    for (const [, categoryMap] of pastMonths) {
      const amount = categoryMap.get(cat.name) ?? 0;
      if (amount > 0) {
        totalPastSpending += amount;
        monthsWithSpending++;
      }
    }

    const monthlyAverage =
      monthsWithSpending > 0 ? totalPastSpending / monthsWithSpending : 0;

    // Get current month spending
    const currentMonthData = monthlyData.get(currentMonthKey);
    const currentMonth = currentMonthData?.get(cat.name) ?? 0;

    // Predict full month based on current rate
    const predictedMonth = monthProgress > 0 ? currentMonth / monthProgress : 0;

    // Calculate change from average (using prediction vs average)
    let changeFromAverage = 0;
    let direction: 'up' | 'down' | 'stable' = 'stable';

    if (monthlyAverage > 0) {
      changeFromAverage = ((predictedMonth - monthlyAverage) / monthlyAverage) * 100;
      if (Math.abs(changeFromAverage) >= 5) {
        direction = changeFromAverage > 0 ? 'up' : 'down';
      }
    } else if (predictedMonth > 0) {
      direction = 'up';
      changeFromAverage = 100;
    }

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      monthlyAverage,
      currentMonth,
      predictedMonth,
      changeFromAverage: Math.abs(changeFromAverage),
      direction,
    };
  });
}

// ============================================================================
// Hook
// ============================================================================

export interface UseSpendingChartOptions {
  transactions: SerializedTransaction[];
  initialTimePeriod?: TimePeriod;
  initialViewMode?: ViewMode;
}

export interface UseSpendingChartReturn {
  // State
  timePeriod: TimePeriod;
  viewMode: ViewMode;

  // Handlers
  setTimePeriod: (period: TimePeriod) => void;
  setViewMode: (mode: ViewMode) => void;

  // Computed data
  filteredTransactions: SerializedTransaction[];
  categoryData: CategorySpending[];
  totalSpending: number;
  weeklyData: WeeklyData[];
  categoryTrends: CategoryTrend[];
  topCategories: CategorySpending[];

  // UI helpers
  isEmpty: boolean;
  currentMonthName: string;
  daysIntoMonth: number;
}

/**
 * Custom hook for spending chart data processing and state management
 *
 * Separates business logic from UI concerns:
 * - Time period filtering
 * - Category aggregation
 * - Weekly/monthly trend calculations
 * - Forecast predictions
 */
export function useSpendingChart({
  transactions,
  initialTimePeriod = 'month',
  initialViewMode = 'overview',
}: UseSpendingChartOptions): UseSpendingChartReturn {
  // State
  const [timePeriod, setTimePeriodState] = useState<TimePeriod>(initialTimePeriod);
  const [viewMode, setViewModeState] = useState<ViewMode>(initialViewMode);

  // Handlers with useCallback for stable references
  const setTimePeriod = useCallback((period: TimePeriod) => {
    setTimePeriodState(period);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  // Computed data with useMemo for performance
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

  const weeklyData = useMemo(
    () => aggregateByWeekAndCategory(filteredTransactions),
    [filteredTransactions]
  );

  // Use all transactions for trend calculation (not filtered)
  const categoryTrends = useMemo(
    () => calculateCategoryTrends(transactions, categoryData),
    [transactions, categoryData]
  );

  const topCategories = useMemo(() => categoryData.slice(0, 6), [categoryData]);

  // UI helpers
  const isEmpty = categoryData.length === 0;
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' });
  const daysIntoMonth = new Date().getDate();

  return {
    // State
    timePeriod,
    viewMode,

    // Handlers
    setTimePeriod,
    setViewMode,

    // Computed data
    filteredTransactions,
    categoryData,
    totalSpending,
    weeklyData,
    categoryTrends,
    topCategories,

    // UI helpers
    isEmpty,
    currentMonthName,
    daysIntoMonth,
  };
}

