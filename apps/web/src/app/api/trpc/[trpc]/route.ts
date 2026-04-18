import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@payments-view/api';

/**
 * tRPC HTTP handler
 */
const handler = (req: Request) => {
  const authHeader = req.headers.get('Authorization');

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        authHeader: authHeader ?? undefined,
        requestHeaders: req.headers,
        requestUrl: req.url,
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
