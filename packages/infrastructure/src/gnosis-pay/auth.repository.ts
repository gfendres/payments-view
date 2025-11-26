import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError } from '@payments-view/domain/shared';
import { AUTH_CONFIG } from '@payments-view/constants';
import type {
  IAuthRepository,
  NonceResult,
  AuthChallengeInput,
  AuthResult,
} from '@payments-view/domain/identity';

import { GnosisPayAuthClient } from './auth-client';

/**
 * Gnosis Pay auth repository implementation
 */
export class GnosisPayAuthRepository implements IAuthRepository {
  private readonly authClient: GnosisPayAuthClient;

  constructor(authClient?: GnosisPayAuthClient) {
    this.authClient = authClient ?? new GnosisPayAuthClient();
  }

  /**
   * Get a nonce for SIWE authentication
   */
  async getNonce(): Promise<Result<NonceResult, ExternalServiceError>> {
    const result = await this.authClient.getNonce();

    if (!result.success) {
      return Result.err(
        new ExternalServiceError('GnosisPay', result.error.message ?? 'Failed to get nonce')
      );
    }

    return Result.ok({ nonce: result.data.nonce });
  }

  /**
   * Submit SIWE challenge and get JWT
   */
  async authenticate(
    input: AuthChallengeInput
  ): Promise<Result<AuthResult, ExternalServiceError>> {
    const result = await this.authClient.submitChallenge({
      message: input.message,
      signature: input.signature,
    });

    if (!result.success) {
      return Result.err(
        new ExternalServiceError(
          'GnosisPay',
          result.error.message ?? 'Authentication failed'
        )
      );
    }

    // Calculate expiration time based on JWT TTL
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.JWT_TTL_MS);

    return Result.ok({
      token: result.data.token,
      expiresAt,
    });
  }
}

