'use client';

import { useState, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button, Input, Label } from '@payments-view/ui';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * Preset date ranges
 */
const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', preset: 'thisMonth' },
  { label: 'Last month', preset: 'lastMonth' },
  { label: 'This year', preset: 'thisYear' },
] as const;

/**
 * Get date range from preset
 */
function getPresetRange(preset: (typeof PRESETS)[number]): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if ('days' in preset) {
    const from = new Date(today);
    from.setDate(from.getDate() - preset.days);
    return { from, to: today };
  }

  switch (preset.preset) {
    case 'thisMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: today,
      };
    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lastMonth, to: lastMonthEnd };
    }
    case 'thisYear':
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: today,
      };
    default:
      return {};
  }
}

/**
 * Format date for display
 */
function formatDate(date?: Date): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for input
 */
function formatDateInput(date?: Date): string {
  if (!date) return '';
  const isoString = date.toISOString();
  const datePart = isoString.split('T')[0];
  return datePart ?? '';
}

/**
 * Date range picker component
 */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayLabel = (): string => {
    if (!value.from && !value.to) return 'All time';
    if (value.from && value.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    }
    if (value.from) return `From ${formatDate(value.from)}`;
    if (value.to) return `Until ${formatDate(value.to)}`;
    return 'All time';
  };

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? new Date(e.target.value) : undefined;
      onChange({ ...value, from: date });
    },
    [value, onChange]
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? new Date(e.target.value) : undefined;
      onChange({ ...value, to: date });
    },
    [value, onChange]
  );

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {getDisplayLabel()}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen ? <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-card p-4 shadow-lg">
            {/* Presets */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    onChange(getPresetRange(preset));
                    setIsOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom range */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="text-sm font-medium text-muted-foreground">Custom range</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="from-date" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={formatDateInput(value.from)}
                    onChange={handleFromChange}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="to-date" className="text-xs">
                    To
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={formatDateInput(value.to)}
                    onChange={handleToChange}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange({});
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
              <Button type="button" size="sm" onClick={() => setIsOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </> : null}
    </div>
  );
}

