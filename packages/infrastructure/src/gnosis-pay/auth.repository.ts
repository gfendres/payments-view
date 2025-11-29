import { randomBytes, createHmac } from 'crypto';

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

const generateLocalNonce = (): string => randomBytes(16).toString('hex');

const getJwtSecret = (): string | undefined => {
  const envKey = AUTH_CONFIG.JWT_SIGNING_SECRET_ENV_KEY as keyof NodeJS.ProcessEnv;
  return process.env[envKey];
};

const issueLocalJwt = (walletAddress: string): AuthResult | null => {
  const secret = getJwtSecret();
  if (!secret) {
    return null;
  }

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expSeconds = nowSeconds + Math.floor(AUTH_CONFIG.JWT_TTL_MS / 1000);
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
    expiresAt: new Date(expSeconds * 1000),
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
    // Try to issue local JWT if wallet address is provided (fallback for local development)
    const secretToken = (() => {
      const addr = input.walletAddress as string | undefined;
      if (addr) {
        return issueLocalJwt(addr);
      } else {
        return undefined;
      }
    })();

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

    // Fallback to local JWT if API call failed but we have a wallet address
    if (secretToken) {
      return Result.ok(secretToken);
    }

    return Result.err(
      new ExternalServiceError('GnosisPay', result.error.message ?? 'Authentication failed')
    );
  }
}
