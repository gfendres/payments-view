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

import { parseAuthHeader } from './middleware';

/**
 * tRPC context for requests
 */
export interface Context {
  /**
   * Authenticated session (if authenticated)
   */
  session: Session | undefined;

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
  // Parse session from auth header
  const session = options.authHeader ? parseAuthHeader(options.authHeader) : undefined;
  const repositories = buildRepositories(options);

  return {
    session: session ?? undefined,
    correlationId: options.correlationId ?? generateCorrelationId(),
    requestHeaders: options.requestHeaders,
    requestUrl: options.requestUrl,
    repositories,
  };
};
