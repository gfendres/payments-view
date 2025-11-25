import { router } from '../trpc';
import { authRouter } from './auth.router';

/**
 * Main app router combining all routers
 */
export const appRouter = router({
  auth: authRouter,
});

/**
 * Export type for client usage
 */
export type AppRouter = typeof appRouter;

export { authRouter } from './auth.router';
