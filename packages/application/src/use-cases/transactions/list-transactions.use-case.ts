import type { Result } from '@payments-view/domain/shared';
import type { DomainError } from '@payments-view/domain/shared';
import type {
  ITransactionRepository,
  TransactionQueryParams,
  PaginatedTransactions,
} from '@payments-view/domain/transaction';

/**
 * List transactions use case input
 */
export interface ListTransactionsInput {
  token: string;
  params?: TransactionQueryParams;
}

/**
 * List transactions use case output
 */
export type ListTransactionsOutput = PaginatedTransactions;

/**
 * List Transactions Use Case
 * Retrieves paginated list of transactions for the authenticated user
 */
export class ListTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  /**
   * Execute the use case
   */
  async execute(
    input: ListTransactionsInput
  ): Promise<Result<ListTransactionsOutput, DomainError>> {
    return this.transactionRepository.getTransactions(input.token, input.params);
  }
}

