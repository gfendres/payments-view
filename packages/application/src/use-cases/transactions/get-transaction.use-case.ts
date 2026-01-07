import type { Result } from '@payments-view/domain/shared';
import type { DomainError } from '@payments-view/domain/shared';
import type { ITransactionRepository, Transaction } from '@payments-view/domain/transaction';

/**
 * Get transaction use case input
 */
export interface GetTransactionInput {
  token: string;
  transactionId: string;
}

/**
 * Get transaction use case output
 */
export type GetTransactionOutput = Transaction;

/**
 * Get Transaction Use Case
 * Retrieves a single transaction by ID
 */
export class GetTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  /**
   * Execute the use case
   */
  async execute(
    input: GetTransactionInput
  ): Promise<Result<GetTransactionOutput, DomainError>> {
    return await this.transactionRepository.getTransaction(input.token, input.transactionId);
  }
}

