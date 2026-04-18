import { FORMAT_CONFIG } from '@payments-view/constants';
import type { Session } from '@payments-view/domain/identity';
import type {
  IAuthRepository,
  IRewardsRepository,
  ITokenPriceRepository,
  ITransactionRepository,
} from '@payments-view/domain';
import {
  CoinGeckoTokenPriceRepository,
  GnosisPayAuthRepository,
  GnosisPayRewardsRepository,
  GnosisPayTransactionRepository,
} from '@payments-view/infrastructure';

import { decodeJwt, parseAuth } from './middleware';

/**
 * tRPC context for requests
 */
export interface Context {
  /**
   * Authenticated session (if authenticated)
   */
  session: Session | undefined;

  /**
   * True when session token is a Gnosis-issued API token (contains userId claim).
   */
  isProviderSession: boolean;

  /**
   * Request correlation ID for logging
   */
  correlationId: string;

  /**
   * Raw request headers for request-scoped upstream forwarding.
   */
  requestHeaders: Headers | undefined;

  /**
   * Request URL when available.
   */
  requestUrl: string | undefined;

  /**
   * Request-scoped dependencies
   */
  repositories: {
    authRepository: IAuthRepository;
    transactionRepository: ITransactionRepository;
    rewardsRepository: IRewardsRepository;
    tokenPriceRepository: ITokenPriceRepository;
  };
}

/**
 * Context creator options
 */
export interface CreateContextOptions {
  authHeader?: string;
  cookieHeader?: string;
  correlationId?: string;
  requestHeaders?: Headers;
  requestUrl?: string;
  repositories?: Partial<Context['repositories']>;
}

/**
 * Generate a correlation ID
 */
const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(FORMAT_CONFIG.UUID.BASE36_RADIX).substring(FORMAT_CONFIG.UUID.ID_SLICE_START, FORMAT_CONFIG.UUID.ID_SLICE_END)}`;
};

const buildAuthRequestContext = (options: CreateContextOptions): {
  origin?: string;
  referer?: string;
} => {
  const requestOrigin =
    options.requestHeaders?.get('origin') ??
    (options.requestUrl ? new URL(options.requestUrl).origin : undefined);
  const referer = options.requestHeaders?.get('referer') ?? options.requestUrl;

  return {
    ...(requestOrigin ? { origin: requestOrigin } : {}),
    ...(referer ? { referer } : {}),
  };
};

const buildRepositories = (
  options: CreateContextOptions = {}
): Context['repositories'] => ({
  authRepository:
    options.repositories?.authRepository ??
    new GnosisPayAuthRepository(undefined, buildAuthRequestContext(options)),
  transactionRepository:
    options.repositories?.transactionRepository ?? new GnosisPayTransactionRepository(),
  rewardsRepository: options.repositories?.rewardsRepository ?? new GnosisPayRewardsRepository(),
  tokenPriceRepository:
    options.repositories?.tokenPriceRepository ??
    new CoinGeckoTokenPriceRepository(undefined, process.env['COINGECKO_API_KEY']),
});

/**
 * Create tRPC context from request
 */
export const createContext = (options: CreateContextOptions = {}): Context => {
  // Parse session from cookie or auth header
  const session = parseAuth({
    authHeader: options.authHeader,
    cookieHeader: options.cookieHeader,
  });
  const repositories = buildRepositories(options);
  const isProviderSession = session ? Boolean(decodeJwt(session.token)?.userId) : false;

  return {
    session: session ?? undefined,
    isProviderSession,
    correlationId: options.correlationId ?? generateCorrelationId(),
    requestHeaders: options.requestHeaders,
    requestUrl: options.requestUrl,
    repositories,
  };
};
