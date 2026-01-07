import { initTRPC, TRPCError } from '@trpc/server';
import { ERROR_HTTP_STATUS, type ErrorCode } from '@payments-view/constants';
import type { DomainError } from '@payments-view/domain/shared';

import type { Context } from './context';

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.cause instanceof Error ? (error.cause as DomainError).code : undefined,
      },
    };
  },
});

/**
 * Export tRPC router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  if (ctx.session.isExpired) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session expired',
    });
  }

  return await next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Convert domain error to tRPC error
 */
export const handleDomainError = (error: DomainError): TRPCError => {
  const errorCode: ErrorCode = error.code;
  const httpStatus = ERROR_HTTP_STATUS[errorCode];

  const codeMap: Record<number, TRPCError['code']> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    404: 'NOT_FOUND',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    501: 'NOT_IMPLEMENTED',
    502: 'BAD_GATEWAY',
    503: 'CLIENT_CLOSED_REQUEST',
  };

  return new TRPCError({
    code: codeMap[httpStatus] ?? 'INTERNAL_SERVER_ERROR',
    message: error.message,
    cause: error,
  });
};

