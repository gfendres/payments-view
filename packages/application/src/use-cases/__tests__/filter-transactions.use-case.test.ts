import { describe, test, expect, beforeEach } from 'bun:test';
import { FilterTransactionsUseCase } from '../transactions/filter-transactions.use-case';
import { CategoryResolverService } from '@payments-view/domain/transaction';
import { Transaction } from '@payments-view/domain/transaction';
import { Money } from '@payments-view/domain/transaction';
import { Merchant } from '@payments-view/domain/transaction';
import { Category } from '@payments-view/domain/transaction';
import {
  TransactionKind,
  TransactionStatus,
  TransactionType,
  CategoryId,
  CurrencyCode,
} from '@payments-view/constants';

describe('FilterTransactionsUseCase', () => {
  let useCase: FilterTransactionsUseCase;
  let categoryResolver: CategoryResolverService;

  beforeEach(() => {
    categoryResolver = new CategoryResolverService();
    useCase = new FilterTransactionsUseCase(categoryResolver);
  });

  const createTransaction = (
    id: string,
    merchantName: string,
    amount: number,
    categoryId: CategoryId,
    createdAt: Date,
    status: TransactionStatus = TransactionStatus.APPROVED,
    city?: string,
    country?: string,
    mcc: string = '5411'
  ): Transaction => {
    const merchant = Merchant.create({
      name: merchantName,
      mcc,
      city,
      country,
    });

    return Transaction.create({
      id,
      threadId: `thread-${id}`,
      kind: TransactionKind.PAYMENT,
      status,
      type: TransactionType.DEBIT,
      billingAmount: Money.fromNumber(amount, CurrencyCode.EUR),
      transactionAmount: Money.fromNumber(amount, CurrencyCode.EUR),
      merchant,
      cardTokenLast4: '1234',
      isPending: false,
      isEligibleForCashback: true,
      createdAt,
    });
  };

  test('should return all transactions when no filters applied', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Store B', 50, CategoryId.RESTAURANTS, new Date('2024-01-20')),
    ];

    const result = useCase.execute({ transactions, criteria: {} });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(2);
      expect(result.value.totalMatched).toBe(2);
      expect(result.value.appliedFilters).toEqual([]);
    }
  });

  test('should filter by search term', () => {
    const transactions = [
      createTransaction('tx1', 'Grocery Store', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Restaurant', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, undefined, '5812'),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { search: 'Grocery' },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters).toContain('search');
    }
  });

  test('should filter by category', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Store B', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, undefined, '5812'),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { categories: [CategoryId.GROCERIES] },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters).toContain('categories');
    }
  });

  test('should filter by date range', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Store B', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, undefined, '5812'),
      createTransaction('tx3', 'Store C', 75, CategoryId.GROCERIES, new Date('2024-02-10')),
    ];

    const result = useCase.execute({
      transactions,
      criteria: {
        after: new Date('2024-01-18'),
        before: new Date('2024-01-25'),
      },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx2');
      expect(result.value.appliedFilters).toContain('after');
      expect(result.value.appliedFilters).toContain('before');
    }
  });

  test('should filter by status', () => {
    const transactions = [
      createTransaction(
        'tx1',
        'Store A',
        100,
        CategoryId.GROCERIES,
        new Date('2024-01-15'),
        TransactionStatus.APPROVED
      ),
      createTransaction(
        'tx2',
        'Store B',
        50,
        CategoryId.DINING,
        new Date('2024-01-20'),
        TransactionStatus.INSUFFICIENT_FUNDS,
        undefined,
        undefined,
        '5812'
      ),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { status: TransactionStatus.INSUFFICIENT_FUNDS },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx2');
      expect(result.value.appliedFilters).toContain('status');
    }
  });

  test('should filter by amount range', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Store B', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, undefined, '5812'),
      createTransaction('tx3', 'Store C', 200, CategoryId.GROCERIES, new Date('2024-02-10')),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { minAmount: 75, maxAmount: 150 },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters).toContain('minAmount');
      expect(result.value.appliedFilters).toContain('maxAmount');
    }
  });

  test('should filter by city', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15'), TransactionStatus.APPROVED, 'Berlin'),
      createTransaction('tx2', 'Store B', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, 'Munich', undefined, '5812'),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { city: 'Berlin' },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters).toContain('city');
    }
  });

  test('should filter by country', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15'), TransactionStatus.APPROVED, undefined, 'Germany'),
      createTransaction('tx2', 'Store B', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, 'France', '5812'),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { country: 'Germany' },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters).toContain('country');
    }
  });

  test('should apply multiple filters', () => {
    const transactions = [
      createTransaction('tx1', 'Grocery Store', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
      createTransaction('tx2', 'Restaurant', 50, CategoryId.DINING, new Date('2024-01-20'), TransactionStatus.APPROVED, undefined, undefined, '5812'),
      createTransaction('tx3', 'Grocery Store', 75, CategoryId.GROCERIES, new Date('2024-02-10')),
    ];

    const result = useCase.execute({
      transactions,
      criteria: {
        search: 'Grocery',
        categories: [CategoryId.GROCERIES],
        minAmount: 80,
      },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0].id).toBe('tx1');
      expect(result.value.appliedFilters.length).toBeGreaterThan(1);
    }
  });

  test('should handle empty result', () => {
    const transactions = [
      createTransaction('tx1', 'Store A', 100, CategoryId.GROCERIES, new Date('2024-01-15')),
    ];

    const result = useCase.execute({
      transactions,
      criteria: { search: 'NonExistent' },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.transactions).toHaveLength(0);
      expect(result.value.totalMatched).toBe(0);
    }
  });
});

