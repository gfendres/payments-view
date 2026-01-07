'use client';

import { useCallback, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryId, CATEGORIES, TransactionStatus } from '@payments-view/constants';
import { Button, Input, SegmentedControl } from '@payments-view/ui';
import { CategorySelector } from './category-selector';
import { DateRangePicker, type DateRange } from './date-range-picker';
import { AmountRangeInput, type AmountRange } from './amount-range-input';
import { ActiveFilters } from './filter-chip';
import { LocationSelector } from './location-selector';
import { useUniqueLocations } from '../hooks/use-unique-locations';
import type { SerializedTransaction } from './transaction-row';

/**
 * Transaction filter state
 */
export interface TransactionFilters {
  search: string;
  categories: CategoryId[];
  dateRange: DateRange;
  status?: TransactionStatus;
  amountRange: AmountRange;
  city?: string;
  country?: string;
}

interface FilterPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  transactions?: SerializedTransaction[];
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
export function FilterPanel({ filters, onFiltersChange, transactions = [] }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);
  const { cities, countries } = useUniqueLocations(transactions, filters.country);

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

  const handleAmountRangeChange = useCallback(
    (amountRange: AmountRange) => {
      onFiltersChange({ ...filters, amountRange });
    },
    [filters, onFiltersChange]
  );

  const handleCityChange = useCallback(
    (city?: string) => {
      onFiltersChange({ ...filters, city });
    },
    [filters, onFiltersChange]
  );

  const handleCountryChange = useCallback(
    (country?: string) => {
      // If a country is selected and a city is currently selected,
      // check if that city exists in transactions from the new country
      if (country && filters.city) {
        const cityExistsInCountry = transactions.some(
          (tx) => tx.merchant.country === country && tx.merchant.city === filters.city
        );

        // If the selected city doesn't exist in the new country, clear it
        if (!cityExistsInCountry) {
          onFiltersChange({ ...filters, country, city: undefined });
          return;
        }
      }
      onFiltersChange({ ...filters, country });
    },
    [filters, onFiltersChange, transactions]
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: [],
      dateRange: {},
      status: undefined,
      amountRange: {},
      city: undefined,
      country: undefined,
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

    if (filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) {
      const min = filters.amountRange.min?.toFixed(2);
      const max = filters.amountRange.max?.toFixed(2);
      const value = min && max ? `€${min} - €${max}` : min ? `Min €${min}` : `Max €${max}`;
      list.push({ key: 'amountRange', label: 'Amount', value });
    }

    if (filters.city) {
      list.push({ key: 'city', label: 'City', value: filters.city });
    }

    if (filters.country) {
      list.push({ key: 'country', label: 'Country', value: filters.country });
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
      } else if (key === 'amountRange') {
        onFiltersChange({ ...filters, amountRange: {} });
      } else if (key === 'city') {
        onFiltersChange({ ...filters, city: undefined });
      } else if (key === 'country') {
        onFiltersChange({ ...filters, country: undefined });
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
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {searchValue ? <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => {
                setSearchValue('');
                onFiltersChange({ ...filters, search: '' });
              }}
            >
              <X className="h-4 w-4" />
            </Button> : null}
        </div>
        <Button
          type="button"
          variant={isExpanded || hasActiveFilters ? 'default' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters ? <span className="bg-primary-foreground text-primary ml-2 rounded-full px-2 py-0.5 text-xs">
              {activeFilters.length}
            </span> : null}
        </Button>
      </div>

      {/* Expanded filters */}
      {isExpanded ? <div className="bg-card/40 grid grid-cols-1 gap-6 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <label className="text-muted-foreground text-sm font-medium">Category</label>
            <CategorySelector
              selectedCategories={filters.categories}
              onChange={handleCategoriesChange}
            />
          </div>

          <div className="space-y-3">
            <label className="text-muted-foreground text-sm font-medium">Date Range</label>
            <DateRangePicker value={filters.dateRange} onChange={handleDateRangeChange} />
          </div>

          <div className="space-y-3">
            <label className="text-muted-foreground text-sm font-medium">Amount</label>
            <AmountRangeInput value={filters.amountRange} onChange={handleAmountRangeChange} />
          </div>

          <div className="space-y-3">
            <label className="text-muted-foreground text-sm font-medium">Status</label>
            <SegmentedControl
              options={STATUS_OPTIONS.map((opt) => ({
                value: opt.value ?? 'all',
                label: opt.label,
              }))}
              value={filters.status ?? 'all'}
              onChange={(val) =>
                handleStatusChange(val === 'all' ? undefined : (val as TransactionStatus))
              }
            />
          </div>

          <div className="space-y-3 sm:col-span-2 lg:col-span-2">
            <label className="text-muted-foreground text-sm font-medium">Location</label>
            <LocationSelector
              cities={cities}
              countries={countries}
              selectedCity={filters.city}
              selectedCountry={filters.country}
              onCityChange={handleCityChange}
              onCountryChange={handleCountryChange}
            />
          </div>
        </div> : null}

      {/* Active filters */}
      <ActiveFilters
        filters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}
