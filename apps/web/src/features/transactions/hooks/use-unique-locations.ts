'use client';

import { useMemo } from 'react';
import type { SerializedTransaction } from '../components';

/**
 * Hook to extract unique cities and countries from transactions
 * @param transactions - List of transactions to extract locations from
 * @param countryFilter - Optional country filter. When provided, only cities from that country are returned
 */
export function useUniqueLocations(
  transactions: SerializedTransaction[],
  countryFilter?: string
) {
  return useMemo(() => {
    const cities = new Set<string>();
    const countries = new Set<string>();

    transactions.forEach((tx) => {
      // If country filter is set, only include cities from that country
      if (countryFilter) {
        if (tx.merchant.country === countryFilter && tx.merchant.city) {
          cities.add(tx.merchant.city);
        }
      } else {
        // No country filter - include all cities
        if (tx.merchant.city) {
          cities.add(tx.merchant.city);
        }
      }

      // Always collect all countries (for the country dropdown)
      if (tx.merchant.country) {
        countries.add(tx.merchant.country);
      }
    });

    return {
      cities: Array.from(cities).sort(),
      countries: Array.from(countries).sort(),
    };
  }, [transactions, countryFilter]);
}

