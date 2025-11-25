import type { Result } from '../../shared/result';
import type { Session } from '../entities/session';
import type { DomainError } from '../../shared/errors';

/**
 * Nonce result from auth provider
 */
export interface NonceResult {
  nonce: string;
}

/**
 * Authentication challenge input
 */
export interface AuthChallengeInput {
  message: string;
  signature: string;
}

/**
 * Authentication result with JWT
 */
export interface AuthResult {
  token: string;
  expiresAt: Date;
}

/**
 * Auth repository interface - abstraction for authentication operations
 */
export interface IAuthRepository {
  /**
   * Get a nonce for SIWE authentication
   */
  getNonce(): Promise<Result<NonceResult, DomainError>>;

  /**
   * Submit SIWE challenge and get JWT
   */
  authenticate(input: AuthChallengeInput): Promise<Result<AuthResult, DomainError>>;

  /**
   * Refresh an existing session token
   */
  refreshToken?(session: Session): Promise<Result<AuthResult, DomainError>>;
}

