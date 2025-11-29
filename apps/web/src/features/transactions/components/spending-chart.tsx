'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { SegmentedControl } from '@payments-view/ui';

import type { SerializedTransaction } from './transaction-row';
import {
  useSpendingChart,
  TIME_PERIODS,
  VIEW_MODES,
  TREND_GROUPINGS,
  type CategorySpending,
  type CategoryTrend,
  type TrendGrouping,
  type TrendPeriodData,
  type TimePeriod,
  type ViewMode,
} from '../hooks/use-spending-chart';

// ============================================================================
// Props
// ============================================================================

interface SpendingChartProps {
  transactions: SerializedTransaction[];
  className?: string;
  showTimeControls?: boolean;
  initialTimePeriod?: TimePeriod;
  initialViewMode?: ViewMode;
  initialTrendGrouping?: TrendGrouping;
}

// ============================================================================
// Sub-components (UI only)
// ============================================================================

/**
 * Pie chart tooltip
 */
function PieTooltip({
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
    <div className="border-border bg-card rounded-lg border p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
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
 * Bar chart tooltip for grouped trend data
 */
function PeriodTooltip({
  active,
  payload,
  label,
  grouping,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  grouping: TrendGrouping;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  const title = (() => {
    if (!label) return 'Spending';
    if (grouping === 'year') return `Year ${label}`;
    if (grouping === 'month') return `Month of ${label}`;
    return `Week of ${label}`;
  })();

  return (
    <div className="border-border bg-card rounded-lg border p-3 shadow-lg">
      <p className="mb-2 font-medium">{title}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium">
              €{entry.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        ))}
        <div className="border-border mt-2 flex justify-between gap-4 border-t pt-2">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">
            €{total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Trend direction indicator
 */
function TrendIndicator({
  direction,
  change,
}: {
  direction: 'up' | 'down' | 'stable';
  change: number;
}) {
  if (direction === 'stable') {
    return (
      <div className="text-muted-foreground flex items-center gap-0.5">
        <Minus className="h-3 w-3" />
        <span className="text-xs">avg</span>
      </div>
    );
  }

  const isUp = direction === 'up';

  return (
    <div className={`flex items-center gap-0.5 ${isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span className="text-xs font-medium">{change.toFixed(0)}%</span>
    </div>
  );
}

/**
 * Category legend for pie chart
 */
function CategoryLegend({ categories }: { categories: CategorySpending[] }) {
  const topCategories = categories.slice(0, 5);
  const othersCount = categories.length - 5;

  return (
    <div className="mt-4 space-y-2">
      {topCategories.map((category) => (
        <div key={category.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="text-muted-foreground">{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              €{category.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-muted-foreground text-xs">
              ({category.percentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      ))}
      {othersCount > 0 && (
        <div className="text-muted-foreground text-xs">+{othersCount} more categories</div>
      )}
    </div>
  );
}

/**
 * Trend legend with monthly comparison
 */
function TrendLegend({
  categories,
  trends,
  currentMonthName,
  daysIntoMonth,
}: {
  categories: CategorySpending[];
  trends: CategoryTrend[];
  currentMonthName: string;
  daysIntoMonth: number;
}) {
  const topCategories = categories.slice(0, 6);

  return (
    <div className="mt-4 space-y-3">
      <div className="text-muted-foreground text-xs font-medium">Monthly Trends (vs Average)</div>

      {/* Header row (desktop only) */}
      <div className="text-muted-foreground hidden items-center justify-between text-[11px] sm:flex">
        <span>Category</span>
        <div className="flex items-center gap-4">
          <span className="w-14 text-right">Avg/mo</span>
          <span className="w-12 text-right">vs Avg</span>
          <span className="w-14 text-right">{currentMonthName}</span>
          <span className="w-14 text-right">Forecast</span>
        </div>
      </div>

      <div className="space-y-2">
        {topCategories.map((category) => {
          const trend = trends.find((t) => t.id === category.id);
          if (!trend) return null;

          const indicator = (
            <TrendIndicator direction={trend.direction} change={trend.changeFromAverage} />
          );

          return (
            <div
              key={category.id}
              className="rounded-lg bg-card/30 px-3 py-2 text-sm sm:bg-transparent sm:px-0 sm:py-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-muted-foreground truncate text-sm sm:text-base">
                    {category.name}
                  </span>
                </div>

                {/* Desktop values */}
                <div className="hidden items-center gap-3 sm:flex">
                  <span className="text-muted-foreground w-14 text-right text-xs">
                    €{trend.monthlyAverage.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <div className="flex w-12 justify-end">{indicator}</div>
                  <span className="w-14 text-right text-xs font-medium">
                    €{trend.currentMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-muted-foreground w-14 text-right text-xs">
                    €{trend.predictedMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Mobile primary value + indicator */}
                <div className="flex items-center gap-2 sm:hidden">
                  {indicator}
                  <span className="text-right text-sm font-semibold">
                    €{trend.currentMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Mobile secondary values */}
              <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground sm:hidden">
                <span>
                  Avg €{trend.monthlyAverage.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <span>
                  Forecast €{trend.predictedMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-muted-foreground border-border mt-2 border-t pt-2 text-xs">
        <span className="italic">Forecast based on {daysIntoMonth} days into the month</span>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
      <BarChart3 className="text-muted-foreground/50 mb-3 h-10 w-10" />
      <p className="text-muted-foreground text-sm">No spending data for this period</p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Spending by category chart component
 *
 * Displays spending data in two views:
 * - Overview: Pie chart with category breakdown
 * - Trends: Stacked bar chart with selectable period data and monthly predictions
 */
export function SpendingChart({
  transactions,
  className,
  showTimeControls = true,
  initialTimePeriod,
  initialViewMode,
  initialTrendGrouping,
}: SpendingChartProps) {
  const {
    timePeriod,
    viewMode,
    trendGrouping,
    setTimePeriod,
    setViewMode,
    setTrendGrouping,
    filteredTransactions,
    categoryData,
    totalSpending,
    trendData,
    categoryTrends,
    topCategories,
    isEmpty,
    currentMonthName,
    daysIntoMonth,
  } = useSpendingChart({
    transactions,
    initialTimePeriod,
    initialViewMode,
    initialTrendGrouping,
  });

  // Controls (shared between views)
  const controls = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <SegmentedControl size="sm" options={VIEW_MODES} value={viewMode} onChange={setViewMode} />
      {showTimeControls ? (
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            size="sm"
            options={TIME_PERIODS}
            value={timePeriod}
            onChange={setTimePeriod}
          />
          {viewMode === 'trends' ? (
            <SegmentedControl
              size="sm"
              options={TREND_GROUPINGS}
              value={trendGrouping}
              onChange={setTrendGrouping}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  // Empty state
  if (isEmpty) {
    return (
      <div className={`flex flex-col ${className ?? ''}`}>
        {controls}
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {controls}

      {viewMode === 'overview' ? (
        <OverviewView
          categoryData={categoryData}
          totalSpending={totalSpending}
          transactionCount={filteredTransactions.length}
        />
      ) : (
        <TrendsView
          trendData={trendData}
          trendGrouping={trendGrouping}
          categoryData={categoryData}
          categoryTrends={categoryTrends}
          topCategories={topCategories}
          totalSpending={totalSpending}
          currentMonthName={currentMonthName}
          daysIntoMonth={daysIntoMonth}
        />
      )}
    </div>
  );
}

// ============================================================================
// View Components
// ============================================================================

/**
 * Overview view with pie chart
 */
function OverviewView({
  categoryData,
  totalSpending,
  transactionCount,
}: {
  categoryData: CategorySpending[];
  totalSpending: number;
  transactionCount: number;
}) {
  return (
    <>
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-sm">Total Spending</p>
        <p className="text-3xl font-bold">
          €{totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-muted-foreground text-xs">{transactionCount} transactions</p>
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
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CategoryLegend categories={categoryData} />
    </>
  );
}

/**
 * Trends view with stacked bar chart
 */
function TrendsView({
  trendData,
  trendGrouping,
  categoryData,
  categoryTrends,
  topCategories,
  totalSpending,
  currentMonthName,
  daysIntoMonth,
}: {
  trendData: TrendPeriodData[];
  trendGrouping: TrendGrouping;
  categoryData: CategorySpending[];
  categoryTrends: CategoryTrend[];
  topCategories: CategorySpending[];
  totalSpending: number;
  currentMonthName: string;
  daysIntoMonth: number;
}) {
  const groupingLabel =
    TREND_GROUPINGS.find((group) => group.value === trendGrouping)?.label ?? 'Weekly';
  const periodUnit =
    trendGrouping === 'year' ? 'years' : trendGrouping === 'month' ? 'months' : 'weeks';

  return (
    <>
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">{groupingLabel} Spending by Category</p>
        <p className="text-2xl font-bold">
          €{totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-muted-foreground text-xs">
          {trendData.length} {periodUnit}
        </p>
      </div>

      {trendData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center">
          <BarChart3 className="text-muted-foreground/50 mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            Not enough data for {groupingLabel.toLowerCase()} trends
          </p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="periodLabel"
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
                tickFormatter={(value: number) =>
                  `€${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                }
              />
              <Tooltip content={<PeriodTooltip grouping={trendGrouping} />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              {topCategories.map((category) => (
                <Bar
                  key={category.id}
                  dataKey={category.name}
                  stackId="spending"
                  fill={category.color}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <TrendLegend
        categories={categoryData}
        trends={categoryTrends}
        currentMonthName={currentMonthName}
        daysIntoMonth={daysIntoMonth}
      />
    </>
  );
}
