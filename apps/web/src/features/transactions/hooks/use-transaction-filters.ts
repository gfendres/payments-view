'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { CategoryId } from '@payments-view/constants';

import type { TransactionFilters } from '../components';

/**
 * Default filter state
 */
const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  categories: [],
  dateRange: {},
  status: undefined,
  amountRange: {},
};

/**
 * Hook for managing transaction filters with URL persistence
 */
export function useTransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL on mount
  const initialFilters = useMemo((): TransactionFilters => {
    const search = searchParams.get('search') ?? '';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? (categoriesParam.split(',') as CategoryId[]) : [];
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status') as TransactionFilters['status'];
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    return {
      search,
      categories,
      dateRange: {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      },
      status: status ?? undefined,
      amountRange: {
        min: minAmount ? parseFloat(minAmount) : undefined,
        max: maxAmount ? parseFloat(maxAmount) : undefined,
      },
    };
  }, [searchParams]);

  const [filters, setFiltersState] = useState<TransactionFilters>(initialFilters);

  /**
   * Update filters and sync to URL
   */
  const setFilters = useCallback(
    (newFilters: TransactionFilters) => {
      setFiltersState(newFilters);

      // Build URL params
      const params = new URLSearchParams();

      if (newFilters.search) {
        params.set('search', newFilters.search);
      }
      if (newFilters.categories.length > 0) {
        params.set('categories', newFilters.categories.join(','));
      }
      if (newFilters.dateRange.from) {
        const fromStr = newFilters.dateRange.from.toISOString().split('T')[0];
        if (fromStr) params.set('from', fromStr);
      }
      if (newFilters.dateRange.to) {
        const toStr = newFilters.dateRange.to.toISOString().split('T')[0];
        if (toStr) params.set('to', toStr);
      }
      if (newFilters.status) {
        params.set('status', newFilters.status);
      }
      if (newFilters.amountRange.min !== undefined) {
        params.set('minAmount', newFilters.amountRange.min.toString());
      }
      if (newFilters.amountRange.max !== undefined) {
        params.set('maxAmount', newFilters.amountRange.max.toString());
      }

      // Update URL without navigation
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.categories.length > 0 ||
      filters.dateRange.from !== undefined ||
      filters.dateRange.to !== undefined ||
      filters.status !== undefined ||
      filters.amountRange.min !== undefined ||
      filters.amountRange.max !== undefined
    );
  }, [filters]);

  /**
   * Convert filters to API query params
   */
  const queryParams = useMemo(() => {
    const params: Record<string, string | string[] | undefined> = {};

    if (filters.dateRange.from) {
      params.after = filters.dateRange.from.toISOString();
    }
    if (filters.dateRange.to) {
      params.before = filters.dateRange.to.toISOString();
    }
    // Note: search and categories would need MCC mapping for API
    // For now, we'll filter client-side

    return params;
  }, [filters.dateRange]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    queryParams,
  };
}

