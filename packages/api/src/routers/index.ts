import { router } from '../trpc';
import { authRouter } from './auth.router';
import { transactionRouter } from './transaction.router';

/**
 * Main app router combining all routers
 */
export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
});

/**
 * Export type for client usage
 */
export type AppRouter = typeof appRouter;

export { authRouter } from './auth.router';
export { transactionRouter } from './transaction.router';
