import { z } from 'zod';
import {
  ListTransactionsUseCase,
  GetTransactionUseCase,
} from '@payments-view/application/use-cases';

import { router, protectedProcedure, handleDomainError } from '../trpc';

import type { Transaction, TransactionQueryParams } from '@payments-view/domain/transaction';

/**
 * Transaction query params schema
 */
const transactionQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  before: z.string().datetime().optional(),
  after: z.string().datetime().optional(),
  billingCurrency: z.string().optional(),
  mcc: z.string().optional(),
  transactionType: z.string().optional(),
  cardTokens: z.array(z.string()).optional(),
});

/**
 * Transaction ID schema
 */
const transactionIdSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
});

/**
 * Serialize transaction entity for API response
 */
function serializeTransaction(tx: Transaction) {
  return {
    id: tx.id,
    threadId: tx.threadId,
    kind: tx.kind,
    status: tx.status,
    type: tx.type,
    billingAmount: {
      amount: tx.billingAmount.toNumber(),
      currency: tx.billingAmount.currency,
      formatted: tx.billingAmount.format(),
    },
    transactionAmount: {
      amount: tx.transactionAmount.toNumber(),
      currency: tx.transactionAmount.currency,
      formatted: tx.transactionAmount.format(),
    },
    merchant: {
      name: tx.merchant.name,
      city: tx.merchant.city,
      country: tx.merchant.country,
      category: tx.merchant.category.name,
      categoryId: tx.merchant.category.id,
      mcc: tx.merchant.mcc,
    },
    cardTokenLast4: tx.cardTokenLast4,
    isPending: tx.isPending,
    isEligibleForCashback: tx.isEligibleForCashback,
    createdAt: tx.createdAt.toISOString(),
    clearedAt: tx.clearedAt?.toISOString(),
    onChainTxHash: tx.onChainTxHash,
  };
}

/**
 * Transaction tRPC router
 */
export const transactionRouter = router({
  /**
   * List transactions with pagination and filters
   */
  list: protectedProcedure.input(transactionQuerySchema).query(async ({ ctx, input }) => {
    const useCase = new ListTransactionsUseCase(ctx.repositories.transactionRepository);

    // Build params object, only including defined values
    const params: TransactionQueryParams = {};
    if (input.limit !== undefined) params.limit = input.limit;
    if (input.offset !== undefined) params.offset = input.offset;
    if (input.before !== undefined) params.before = new Date(input.before);
    if (input.after !== undefined) params.after = new Date(input.after);
    if (input.billingCurrency !== undefined) params.billingCurrency = input.billingCurrency;
    if (input.mcc !== undefined) params.mcc = input.mcc;
    if (input.transactionType !== undefined) params.transactionType = input.transactionType;
    if (input.cardTokens !== undefined) params.cardTokens = input.cardTokens;

    const result = await useCase.execute({
      token: ctx.session.token,
      params,
    });

    if (result.isFailure) {
      throw handleDomainError(result.error);
    }

    return {
      transactions: result.value.transactions.map(serializeTransaction),
      total: result.value.total,
      limit: result.value.limit,
      offset: result.value.offset,
      hasMore: result.value.hasMore,
    };
  }),

  /**
   * Get a single transaction by ID
   */
  get: protectedProcedure.input(transactionIdSchema).query(async ({ ctx, input }) => {
    const useCase = new GetTransactionUseCase(ctx.repositories.transactionRepository);

    const result = await useCase.execute({
      token: ctx.session.token,
      transactionId: input.transactionId,
    });

    if (result.isFailure) {
      throw handleDomainError(result.error);
    }

    return serializeTransaction(result.value);
  }),
});

export type TransactionRouter = typeof transactionRouter;
