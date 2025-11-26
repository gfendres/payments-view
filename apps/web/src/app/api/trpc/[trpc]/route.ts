import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@payments-view/api';

/**
 * tRPC HTTP handler
 */
const handler = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  // Debug logging
  console.log(`[tRPC Route] ${req.method} - Auth header: ${authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'MISSING'}`);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        authHeader: authHeader ?? undefined,
      }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };

