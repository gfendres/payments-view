import { Result } from '@payments-view/domain/shared';
import type { Transaction, CategoryResolverService } from '@payments-view/domain/transaction';
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

    // Apply search filter
    const searchTerm = criteria.search?.trim();
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.merchant.name.toLowerCase().includes(searchLower)
      );
      appliedFilters.push('search');
    }

    // Apply category filter
    const categories = criteria.categories;
    if (categories?.length) {
      filtered = filtered.filter((tx) =>
        this.categoryResolver.mccMatchesCategories(tx.merchant.mcc, categories)
      );
      appliedFilters.push('categories');
    }

    // Apply date range filter
    const { after, before } = criteria;
    if (after) {
      filtered = filtered.filter((tx) => tx.createdAt >= after);
      appliedFilters.push('after');
    }

    if (before) {
      filtered = filtered.filter((tx) => tx.createdAt <= before);
      appliedFilters.push('before');
    }

    // Apply status filter
    if (criteria.status) {
      filtered = filtered.filter((tx) => tx.status === criteria.status);
      appliedFilters.push('status');
    }

    // Apply amount range filters
    const { minAmount, maxAmount } = criteria;
    if (minAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() >= minAmount);
      appliedFilters.push('minAmount');
    }

    if (maxAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() <= maxAmount);
      appliedFilters.push('maxAmount');
    }

    return Result.ok({
      transactions: filtered,
      totalMatched: filtered.length,
      appliedFilters,
    });
  }
}
