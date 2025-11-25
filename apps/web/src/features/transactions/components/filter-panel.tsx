'use client';

import { useCallback, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryId, CATEGORIES, TransactionStatus } from '@payments-view/constants';
import { Button, Input } from '@payments-view/ui';

import { CategorySelector } from './category-selector';
import { DateRangePicker, type DateRange } from './date-range-picker';
import { ActiveFilters } from './filter-chip';

/**
 * Transaction filter state
 */
export interface TransactionFilters {
  search: string;
  categories: CategoryId[];
  dateRange: DateRange;
  status?: TransactionStatus;
}

interface FilterPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

/**
 * Status options for filtering
 */
const STATUS_OPTIONS = [
  { value: undefined, label: 'All' },
  { value: TransactionStatus.APPROVED, label: 'Completed' },
  { value: TransactionStatus.REVERSAL, label: 'Reversed' },
] as const;

/**
 * Filter panel component
 */
export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounced search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      // Debounce the actual filter update
      const timeoutId = setTimeout(() => {
        onFiltersChange({ ...filters, search: value });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [filters, onFiltersChange]
  );

  const handleCategoriesChange = useCallback(
    (categories: CategoryId[]) => {
      onFiltersChange({ ...filters, categories });
    },
    [filters, onFiltersChange]
  );

  const handleDateRangeChange = useCallback(
    (dateRange: DateRange) => {
      onFiltersChange({ ...filters, dateRange });
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (status?: TransactionStatus) => {
      onFiltersChange({ ...filters, status });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: [],
      dateRange: {},
      status: undefined,
    });
  }, [onFiltersChange]);

  // Build active filters list for display
  const activeFilters = useMemo(() => {
    const list: Array<{ key: string; label: string; value: string; color?: string }> = [];

    if (filters.search) {
      list.push({ key: 'search', label: 'Search', value: filters.search });
    }

    filters.categories.forEach((cat) => {
      const category = CATEGORIES[cat];
      list.push({
        key: `category-${cat}`,
        label: 'Category',
        value: category.name,
        color: category.color,
      });
    });

    if (filters.dateRange.from || filters.dateRange.to) {
      const from = filters.dateRange.from?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const to = filters.dateRange.to?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({
        key: 'dateRange',
        label: 'Date',
        value: from && to ? `${from} - ${to}` : from ? `From ${from}` : `Until ${to}`,
      });
    }

    if (filters.status) {
      const statusLabel = STATUS_OPTIONS.find((s) => s.value === filters.status)?.label ?? filters.status;
      list.push({ key: 'status', label: 'Status', value: statusLabel });
    }

    return list;
  }, [filters]);

  const handleRemoveFilter = useCallback(
    (key: string) => {
      if (key === 'search') {
        setSearchValue('');
        onFiltersChange({ ...filters, search: '' });
      } else if (key.startsWith('category-')) {
        const categoryId = key.replace('category-', '') as CategoryId;
        onFiltersChange({
          ...filters,
          categories: filters.categories.filter((c) => c !== categoryId),
        });
      } else if (key === 'dateRange') {
        onFiltersChange({ ...filters, dateRange: {} });
      } else if (key === 'status') {
        onFiltersChange({ ...filters, status: undefined });
      }
    },
    [filters, onFiltersChange]
  );

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and expand */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => {
                setSearchValue('');
                onFiltersChange({ ...filters, search: '' });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant={isExpanded || hasActiveFilters ? 'default' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-primary-foreground px-2 py-0.5 text-xs text-primary">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card/50 p-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <CategorySelector
              selectedCategories={filters.categories}
              onChange={handleCategoriesChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date Range</label>
            <DateRangePicker value={filters.dateRange} onChange={handleDateRangeChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={filters.status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters */}
      <ActiveFilters
        filters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}

