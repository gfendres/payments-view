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
    if (criteria.search && criteria.search.trim()) {
      const searchLower = criteria.search.toLowerCase().trim();
      filtered = filtered.filter((tx) =>
        tx.merchant.name.toLowerCase().includes(searchLower)
      );
      appliedFilters.push('search');
    }

    // Apply category filter
    if (criteria.categories && criteria.categories.length > 0) {
      filtered = filtered.filter((tx) =>
        this.categoryResolver.mccMatchesCategories(tx.merchant.mcc, criteria.categories!)
      );
      appliedFilters.push('categories');
    }

    // Apply date range filter
    if (criteria.after) {
      filtered = filtered.filter((tx) => tx.createdAt >= criteria.after!);
      appliedFilters.push('after');
    }

    if (criteria.before) {
      filtered = filtered.filter((tx) => tx.createdAt <= criteria.before!);
      appliedFilters.push('before');
    }

    // Apply status filter
    if (criteria.status) {
      filtered = filtered.filter((tx) => tx.status === criteria.status);
      appliedFilters.push('status');
    }

    // Apply amount range filters
    if (criteria.minAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() >= criteria.minAmount!);
      appliedFilters.push('minAmount');
    }

    if (criteria.maxAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.billingAmount.toNumber() <= criteria.maxAmount!);
      appliedFilters.push('maxAmount');
    }

    return Result.ok({
      transactions: filtered,
      totalMatched: filtered.length,
      appliedFilters,
    });
  }
}

