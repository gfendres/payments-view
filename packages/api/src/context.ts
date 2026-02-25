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
   * Full request URL (when available)
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
  requestUrl?: string;
  correlationId?: string;
  repositories?: Partial<Context['repositories']>;
}

/**
 * Generate a correlation ID
 */
const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(FORMAT_CONFIG.UUID.BASE36_RADIX).substring(FORMAT_CONFIG.UUID.ID_SLICE_START, FORMAT_CONFIG.UUID.ID_SLICE_END)}`;
};

const buildRepositories = (
  repositories?: CreateContextOptions['repositories']
): Context['repositories'] => ({
  authRepository: repositories?.authRepository ?? new GnosisPayAuthRepository(),
  transactionRepository:
    repositories?.transactionRepository ?? new GnosisPayTransactionRepository(),
  rewardsRepository: repositories?.rewardsRepository ?? new GnosisPayRewardsRepository(),
  tokenPriceRepository:
    repositories?.tokenPriceRepository ??
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
  const repositories = buildRepositories(options.repositories);
  const isProviderSession = session ? Boolean(decodeJwt(session.token)?.userId) : false;

  return {
    session: session ?? undefined,
    isProviderSession,
    correlationId: options.correlationId ?? generateCorrelationId(),
    requestUrl: options.requestUrl,
    repositories,
  };
};
