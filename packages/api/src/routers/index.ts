import { router } from '../trpc';
import { authRouter } from './auth.router';
import { transactionRouter } from './transaction.router';
import { rewardsRouter } from './rewards.router';

/**
 * Main app router combining all routers
 */
export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
  rewards: rewardsRouter,
});

/**
 * Export type for client usage
 */
export type AppRouter = typeof appRouter;

export { authRouter } from './auth.router';
export { transactionRouter } from './transaction.router';
export { rewardsRouter } from './rewards.router';
