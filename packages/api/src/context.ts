import type { Session } from '@payments-view/domain/identity';

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
}

/**
 * Context creator options
 */
export interface CreateContextOptions {
  authHeader?: string;
  correlationId?: string;
}

/**
 * Generate a correlation ID
 */
const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create tRPC context from request
 */
export const createContext = (options: CreateContextOptions = {}): Context => {
  // Parse session from auth header
  const session = options.authHeader ? parseAuthHeader(options.authHeader) : undefined;

  return {
    session: session ?? undefined,
    correlationId: options.correlationId ?? generateCorrelationId(),
  };
};

