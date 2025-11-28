'use client';

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { Card, CardContent } from '../../primitives';

/**
 * Icon color presets for stat cards.
 */
export const ICON_COLORS = {
  primary: { bg: 'bg-primary/20', text: 'text-primary' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-500' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500' },
  red: { bg: 'bg-red-500/20', text: 'text-red-500' },
  muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
} as const;

export type IconColor = keyof typeof ICON_COLORS;

interface TrendData {
  value: number;
  previousValue: number;
  period?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: IconColor;
  trend?: TrendData;
  valueColor?: 'default' | 'success' | 'warning' | 'destructive';
  /** Layout: 'vertical' has icon on right, 'horizontal' has icon on left */
  layout?: 'vertical' | 'horizontal';
  /** Size: 'lg' for featured stats, 'default' for regular */
  size?: 'default' | 'lg';
  className?: string;
}

/**
 * Calculate percentage change between two values.
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change for display.
 */
function formatPercentage(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return `${Math.round(abs)}%`;
  if (abs >= 10) return `${abs.toFixed(0)}%`;
  return `${abs.toFixed(1)}%`;
}

/**
 * Get trend icon and color based on percentage change.
 */
function getTrendInfo(percentageChange: number) {
  if (percentageChange > 0) {
    return {
      Icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    };
  }
  if (percentageChange < 0) {
    return {
      Icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    };
  }
  return {
    Icon: Minus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  };
}

/**
 * Value color classes.
 */
const VALUE_COLORS = {
  default: 'text-foreground',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  destructive: 'text-red-500',
};

function getTrendData(trend?: TrendData) {
  if (!trend) {
    return { percentageChange: 0, trendInfo: null, trendPeriod: undefined as string | undefined };
  }
  const percentageChange = calculatePercentageChange(trend.value, trend.previousValue);
  return {
    percentageChange,
    trendInfo: getTrendInfo(percentageChange),
    trendPeriod: trend.period,
  };
}

function getSizeTokens(size: 'default' | 'lg') {
  if (size === 'lg') {
    return { valueSize: 'text-4xl', iconSize: 'p-4', iconContainerSize: 'h-8 w-8' };
  }
  return { valueSize: 'text-2xl', iconSize: 'p-3', iconContainerSize: 'h-5 w-5' };
}

interface LayoutProps {
  title: string;
  subtitle?: string;
  value: string | number;
  valueSize: string;
  valueColor: keyof typeof VALUE_COLORS;
  icon?: ReactNode;
  colors: (typeof ICON_COLORS)[IconColor];
  iconSize: string;
  iconContainerSize: string;
  trendInfo: ReturnType<typeof getTrendInfo> | null;
  percentageChange: number;
  trendPeriod?: string;
  className?: string;
}

function TrendBadge({
  trendInfo,
  percentageChange,
  trendPeriod,
  size = 'sm',
}: {
  trendInfo: ReturnType<typeof getTrendInfo>;
  percentageChange: number;
  trendPeriod?: string;
  size?: 'sm' | 'lg';
}) {
  const percentageLabel = formatPercentage(percentageChange);

  if (size === 'lg') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <div className={`flex items-center gap-1 rounded-lg px-2 py-1 ${trendInfo.bgColor}`}>
          <trendInfo.Icon className={`h-3.5 w-3.5 ${trendInfo.color}`} />
          <span className={`text-xs font-medium ${trendInfo.color}`}>{percentageLabel}</span>
        </div>
        {trendPeriod && <span className="text-[10px] text-muted-foreground">vs {trendPeriod}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 ${trendInfo.bgColor}`}>
      <trendInfo.Icon className={`h-3 w-3 ${trendInfo.color}`} />
      <span className={`text-[10px] font-medium ${trendInfo.color}`}>{percentageLabel}</span>
    </div>
  );
}

function HorizontalStatCard({
  title,
  subtitle,
  value,
  valueColor,
  icon,
  colors,
  iconSize,
  iconContainerSize,
  trendInfo,
  percentageChange,
  className,
}: LayoutProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 pt-6">
        {icon && (
          <div className={`rounded-xl ${colors.bg} ${iconSize} ${colors.text}`}>
            <div className={iconContainerSize}>{icon}</div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <p className={`text-lg font-bold ${VALUE_COLORS[valueColor]}`}>{value}</p>
            {trendInfo && (
              <TrendBadge
                trendInfo={trendInfo}
                percentageChange={percentageChange}
                size="sm"
              />
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function VerticalStatCard({
  title,
  subtitle,
  value,
  valueSize,
  valueColor,
  icon,
  colors,
  iconSize,
  iconContainerSize,
  trendInfo,
  percentageChange,
  trendPeriod,
  className,
}: LayoutProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`mt-1 font-bold ${valueSize} ${VALUE_COLORS[valueColor]}`}>{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            {trendInfo && (
              <TrendBadge
                trendInfo={trendInfo}
                percentageChange={percentageChange}
                {...(trendPeriod ? { trendPeriod } : {})}
                size="lg"
              />
            )}
          </div>
          {icon && (
            <div className={`rounded-xl ${colors.bg} ${iconSize} ${colors.text} shrink-0`}>
              <div className={iconContainerSize}>{icon}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reusable stat card component with multiple layouts.
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'muted',
  trend,
  valueColor = 'default',
  layout = 'vertical',
  size = 'default',
  className,
}: StatCardProps) {
  const colors = ICON_COLORS[iconColor];
  const { percentageChange, trendInfo, trendPeriod } = getTrendData(trend);
  const { valueSize, iconSize, iconContainerSize } = getSizeTokens(size);

  const layoutProps: LayoutProps = {
    title,
    value,
    valueSize,
    valueColor,
    icon,
    colors,
    iconSize,
    iconContainerSize,
    trendInfo,
    percentageChange,
  };

  if (subtitle !== undefined) {
    layoutProps.subtitle = subtitle;
  }
  if (trendPeriod !== undefined) {
    layoutProps.trendPeriod = trendPeriod;
  }
  if (className !== undefined) {
    layoutProps.className = className;
  }

  return layout === 'horizontal' ? (
    <HorizontalStatCard {...layoutProps} />
  ) : (
    <VerticalStatCard {...layoutProps} />
  );
}
