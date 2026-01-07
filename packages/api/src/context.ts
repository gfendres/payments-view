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
  // Parse session from auth header
  const session = options.authHeader ? parseAuthHeader(options.authHeader) : undefined;
  const repositories = buildRepositories(options.repositories);

  return {
    session: session ?? undefined,
    correlationId: options.correlationId ?? generateCorrelationId(),
    repositories,
  };
};
