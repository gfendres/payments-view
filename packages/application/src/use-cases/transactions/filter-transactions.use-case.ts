import { Result } from '@payments-view/domain/shared';
import type { CategoryResolverService, Transaction } from '@payments-view/domain/transaction';
import type { CategoryId, TransactionStatus } from '@payments-view/constants';

/**
 * Filter criteria for transactions
 */
export interface TransactionFilterCriteria {
  /** Search text to match against merchant name */
  search?: string;
  /** Categories to filter by */
  categories?: CategoryId[];
  /** Date range - transactions after this date */
  after?: Date;
  /** Date range - transactions before this date */
  before?: Date;
  /** Transaction status filter */
  status?: TransactionStatus;
  /** Minimum amount filter */
  minAmount?: number;
  /** Maximum amount filter */
  maxAmount?: number;
  /** City filter */
  city?: string;
  /** Country filter */
  country?: string;
}

/**
 * Filter transactions use case input
 */
export interface FilterTransactionsInput {
  transactions: Transaction[];
  criteria: TransactionFilterCriteria;
}

/**
 * Filter transactions use case output
 */
export interface FilterTransactionsOutput {
  transactions: Transaction[];
  totalMatched: number;
  appliedFilters: string[];
}

/**
 * Filter Transactions Use Case
 * Applies client-side filters to a list of transactions
 */
export class FilterTransactionsUseCase {
  constructor(private readonly categoryResolver: CategoryResolverService) {}

  /**
   * Execute the use case
   */
  execute(input: FilterTransactionsInput): Result<FilterTransactionsOutput, never> {
    const { transactions, criteria } = input;
    const appliedFilters: string[] = [];

    let filtered = [...transactions];

    filtered = this.applySearchFilter(filtered, criteria.search, appliedFilters);
    filtered = this.applyCategoryFilter(filtered, criteria.categories, appliedFilters);
    filtered = this.applyDateRangeFilter(filtered, criteria.after, criteria.before, appliedFilters);
    filtered = this.applyStatusFilter(filtered, criteria.status, appliedFilters);
    filtered = this.applyAmountRangeFilter(filtered, criteria.minAmount, criteria.maxAmount, appliedFilters);
    filtered = this.applyLocationFilter(filtered, criteria.city, criteria.country, appliedFilters);

    return Result.ok({
      transactions: filtered,
      totalMatched: filtered.length,
      appliedFilters,
    });
  }

  private applySearchFilter(
    transactions: Transaction[],
    search: string | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    const searchTerm = search?.trim();
    if (!searchTerm) return transactions;

    const searchLower = searchTerm.toLowerCase();
    appliedFilters.push('search');

    return transactions.filter((tx) => {
      const matchesMerchant = tx.merchant.name.toLowerCase().includes(searchLower);
      const matchesCategory = tx.category.name.toLowerCase().includes(searchLower);
      return matchesMerchant || matchesCategory;
    });
  }

  private applyCategoryFilter(
    transactions: Transaction[],
    categories: CategoryId[] | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    if (!categories?.length) return transactions;

    appliedFilters.push('categories');
    return transactions.filter((tx) =>
      this.categoryResolver.mccMatchesCategories(tx.merchant.mcc, categories)
    );
  }

  private applyDateRangeFilter(
    transactions: Transaction[],
    after: Date | undefined,
    before: Date | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    let filtered = transactions;

    if (after) {
      filtered = filtered.filter((tx) => tx.createdAt >= after);
      appliedFilters.push('after');
    }

    if (before) {
      filtered = filtered.filter((tx) => tx.createdAt <= before);
      appliedFilters.push('before');
    }

    return filtered;
  }

  private applyStatusFilter(
    transactions: Transaction[],
    status: TransactionStatus | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    if (!status) return transactions;

    appliedFilters.push('status');
    return transactions.filter((tx) => tx.status === status);
  }

  private applyAmountRangeFilter(
    transactions: Transaction[],
    minAmount: number | undefined,
    maxAmount: number | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    let filtered = transactions;

    if (minAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() >= minAmount);
      appliedFilters.push('minAmount');
    }

    if (maxAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() <= maxAmount);
      appliedFilters.push('maxAmount');
    }

    return filtered;
  }

  private applyLocationFilter(
    transactions: Transaction[],
    city: string | undefined,
    country: string | undefined,
    appliedFilters: string[]
  ): Transaction[] {
    let filtered = transactions;

    if (city) {
      filtered = filtered.filter((tx) => tx.merchant.city === city);
      appliedFilters.push('city');
    }

    if (country) {
      filtered = filtered.filter((tx) => tx.merchant.country === country);
      appliedFilters.push('country');
    }

    return filtered;
  }
}
