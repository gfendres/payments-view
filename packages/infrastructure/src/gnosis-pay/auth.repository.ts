import { createHmac, randomBytes } from 'crypto';

import { ExternalServiceError, Result } from '@payments-view/domain/shared';
import { AUTH_CONFIG, FORMAT_CONFIG } from '@payments-view/constants';
import type {
  AuthChallengeInput,
  AuthResult,
  IAuthRepository,
  NonceResult,
} from '@payments-view/domain/identity';

import { GnosisPayAuthClient } from './auth-client';

const generateLocalNonce = (): string => randomBytes(FORMAT_CONFIG.CRYPTO.NONCE_BYTES).toString('hex');

const getJwtSecret = (): string | undefined => {
  const envKey = AUTH_CONFIG.JWT_SIGNING_SECRET_ENV_KEY as keyof NodeJS.ProcessEnv;
  return process.env[envKey];
};

const isLocalJwtFallbackEnabled = (): boolean =>
  process.env.NODE_ENV !== 'production' && process.env.ENABLE_LOCAL_JWT_FALLBACK === 'true';

const issueLocalJwt = (walletAddress: string): AuthResult | null => {
  const secret = getJwtSecret();
  if (!secret) {
    return null;
  }

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const nowSeconds = Math.floor(Date.now() / FORMAT_CONFIG.TIME.MS_PER_SECOND);
  const expSeconds = nowSeconds + Math.floor(AUTH_CONFIG.JWT_TTL_MS / FORMAT_CONFIG.TIME.MS_PER_SECOND);
  const payload = Buffer.from(
    JSON.stringify({
      signerAddress: walletAddress,
      chainId: AUTH_CONFIG.CHAIN_ID,
      iat: nowSeconds,
      exp: expSeconds,
    })
  ).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');

  return {
    token: `${unsigned}.${signature}`,
    expiresAt: new Date(expSeconds * FORMAT_CONFIG.TIME.MS_PER_SECOND),
  };
};

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

    if (result.success) {
      return Result.ok({ nonce: result.data.nonce });
    }

    const localNonce = generateLocalNonce();
    return Result.ok({ nonce: localNonce });
  }

  /**
   * Submit SIWE challenge and get JWT
   */
  async authenticate(input: AuthChallengeInput): Promise<Result<AuthResult, ExternalServiceError>> {
    const localFallbackEnabled = isLocalJwtFallbackEnabled();

    // Try to issue local JWT for explicitly enabled local development
    const secretToken =
      localFallbackEnabled && input.walletAddress ? issueLocalJwt(input.walletAddress) : null;

    const result = await this.authClient.submitChallenge({
      message: input.message,
      signature: input.signature,
    });

    if (result.success) {
      const expiresAt = new Date(Date.now() + AUTH_CONFIG.JWT_TTL_MS);
      return Result.ok({
        token: result.data.token,
        expiresAt,
      });
    }

    // Optional: allow local JWT only when explicitly enabled and API call fails
    if (localFallbackEnabled && secretToken) {
      return Result.ok(secretToken);
    }

    return Result.err(
      new ExternalServiceError('GnosisPay', result.error.message ?? 'Authentication failed')
    );
  }
}
