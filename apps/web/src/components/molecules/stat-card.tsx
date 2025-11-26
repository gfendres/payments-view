'use client';

import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@payments-view/ui';

/**
 * Icon color presets
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

interface StatCardProps {
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
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change for display
 */
function formatPercentage(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return `${Math.round(abs)}%`;
  if (abs >= 10) return `${abs.toFixed(0)}%`;
  return `${abs.toFixed(1)}%`;
}

/**
 * Get trend icon and color based on percentage change
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
 * Value color classes
 */
const VALUE_COLORS = {
  default: 'text-foreground',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  destructive: 'text-red-500',
};

/**
 * Reusable stat card component with multiple layouts
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
  const percentageChange = trend
    ? calculatePercentageChange(trend.value, trend.previousValue)
    : 0;
  const trendInfo = trend ? getTrendInfo(percentageChange) : null;

  const valueSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  const iconSize = size === 'lg' ? 'p-4' : 'p-3';
  const iconContainerSize = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';

  // Horizontal layout: icon on left
  if (layout === 'horizontal') {
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
                <div className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 ${trendInfo.bgColor}`}>
                  <trendInfo.Icon className={`h-3 w-3 ${trendInfo.color}`} />
                  <span className={`text-[10px] font-medium ${trendInfo.color}`}>
                    {formatPercentage(percentageChange)}
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vertical layout: icon on right (default)
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`mt-1 font-bold ${valueSize} ${VALUE_COLORS[valueColor]}`}>{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trendInfo && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`flex items-center gap-1 rounded-lg px-2 py-1 ${trendInfo.bgColor}`}>
                  <trendInfo.Icon className={`h-3.5 w-3.5 ${trendInfo.color}`} />
                  <span className={`text-xs font-medium ${trendInfo.color}`}>
                    {formatPercentage(percentageChange)}
                  </span>
                </div>
                {trend?.period && (
                  <span className="text-[10px] text-muted-foreground">
                    vs {trend.period}
                  </span>
                )}
              </div>
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
