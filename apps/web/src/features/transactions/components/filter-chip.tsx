'use client';

import { X } from 'lucide-react';
import { Button } from '@payments-view/ui';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: string;
}

/**
 * Filter chip component - displays an active filter with remove button
 */
export function FilterChip({ label, value, onRemove, color }: FilterChipProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1 text-sm"
      style={color ? { borderColor: color, backgroundColor: `${color}10` } : undefined}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove filter</span>
      </Button>
    </div>
  );
}

interface ActiveFiltersProps {
  filters: Array<{ key: string; label: string; value: string; color?: string }>;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

/**
 * Active filters display component
 */
export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          value={filter.value}
          color={filter.color}
          onRemove={() => onRemoveFilter(filter.key)}
        />
      ))}
      {filters.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

