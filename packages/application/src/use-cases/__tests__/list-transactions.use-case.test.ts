import { describe, test, expect, mock } from 'bun:test';
import { ListTransactionsUseCase } from '../transactions/list-transactions.use-case';
import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError } from '@payments-view/domain/shared';
import type { ITransactionRepository, PaginatedTransactions } from '@payments-view/domain/transaction';

describe('ListTransactionsUseCase', () => {
  test('should call repository with correct parameters', async () => {
    const mockRepository: ITransactionRepository = {
      getTransactions: mock(() =>
        Promise.resolve(
          Result.ok({
            transactions: [],
            total: 0,
            limit: 10,
            offset: 0,
            hasMore: false,
          })
        )
      ),
      getTransaction: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
    };

    const useCase = new ListTransactionsUseCase(mockRepository);
    const token = 'test-token';
    const params = { limit: 20, offset: 0 };

    await useCase.execute({ token, params });

    expect(mockRepository.getTransactions).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTransactions).toHaveBeenCalledWith(token, params);
  });

  test('should return repository result', async () => {
    const expectedResult: PaginatedTransactions = {
      transactions: [],
      total: 0,
      limit: 10,
      offset: 0,
      hasMore: false,
    };

    const mockRepository: ITransactionRepository = {
      getTransactions: mock(() => Promise.resolve(Result.ok(expectedResult))),
      getTransaction: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
    };

    const useCase = new ListTransactionsUseCase(mockRepository);
    const result = await useCase.execute({ token: 'test-token' });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value).toEqual(expectedResult);
    }
  });

  test('should propagate errors from repository', async () => {
    const error = new ExternalServiceError('test', 'Repository error');
    const mockRepository: ITransactionRepository = {
      getTransactions: mock(() => Promise.resolve(Result.err(error))),
      getTransaction: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
    };

    const useCase = new ListTransactionsUseCase(mockRepository);
    const result = await useCase.execute({ token: 'test-token' });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBe(error);
    }
  });
});

