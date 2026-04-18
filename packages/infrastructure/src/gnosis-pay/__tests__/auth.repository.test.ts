import { afterEach, describe, expect, test } from 'bun:test';

import { ExternalServiceError } from '@payments-view/domain/shared';

import { GnosisPayAuthRepository } from '../auth.repository';

const originalEnv: {
  enableLocalJwtFallback: string | undefined;
  nodeEnv: NodeJS.ProcessEnv['NODE_ENV'];
} = {
  enableLocalJwtFallback: process.env.ENABLE_LOCAL_JWT_FALLBACK,
  nodeEnv: process.env.NODE_ENV,
};

afterEach(() => {
  if (typeof originalEnv.enableLocalJwtFallback === 'undefined') {
    Reflect.deleteProperty(process.env, 'ENABLE_LOCAL_JWT_FALLBACK');
  } else {
    process.env.ENABLE_LOCAL_JWT_FALLBACK = originalEnv.enableLocalJwtFallback;
  }

  if (typeof originalEnv.nodeEnv === 'undefined') {
    Reflect.deleteProperty(process.env, 'NODE_ENV');
  } else {
    process.env.NODE_ENV = originalEnv.nodeEnv;
  }
});

describe('GnosisPayAuthRepository.getNonce', () => {
  test('returns the provider nonce and SIWE cookie when the upstream request succeeds', async () => {
    const repository = new GnosisPayAuthRepository({
      getNonce: () =>
        Promise.resolve({
        success: true,
        data: { nonce: 'provider-nonce', siweCookie: 'siwe-session=test' },
      }),
      submitChallenge: () =>
        Promise.resolve({
          success: false,
          error: { error: 'NOT_USED', message: 'not used' },
        }),
    } as never);

    const result = await repository.getNonce();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.nonce).toBe('provider-nonce');
      expect(result.value.siweCookie).toBe('siwe-session=test');
    }
  });

  test('fails instead of fabricating a nonce when local fallback is disabled', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'false';

    const repository = new GnosisPayAuthRepository({
      getNonce: () =>
        Promise.resolve({
        success: false,
        error: {
          error: 'NONCE_ERROR',
          message: 'Failed to get nonce: forbidden',
          statusCode: 403,
        },
      }),
      submitChallenge: () =>
        Promise.resolve({
          success: false,
          error: { error: 'NOT_USED', message: 'not used' },
        }),
    } as never);

    const result = await repository.getNonce();

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(ExternalServiceError);
      expect(result.error.message).toContain('Failed to get nonce');
    }
  });

  test('fabricates a nonce only when local fallback is explicitly enabled', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'true';

    const repository = new GnosisPayAuthRepository({
      getNonce: () =>
        Promise.resolve({
        success: false,
        error: {
          error: 'NONCE_ERROR',
          message: 'Failed to get nonce: forbidden',
          statusCode: 403,
        },
      }),
      submitChallenge: () =>
        Promise.resolve({
          success: false,
          error: { error: 'NOT_USED', message: 'not used' },
        }),
    } as never);

    const result = await repository.getNonce();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.nonce).toMatch(/^[a-f0-9]+$/);
      expect(result.value.nonce.length).toBeGreaterThan(0);
    }
  });
});

describe('GnosisPayAuthRepository.authenticate', () => {
  test('forwards the SIWE cookie, browser headers, and JWT ttl to the challenge request', async () => {
    let capturedRequest: unknown;
    let capturedOptions: unknown;

    const repository = new GnosisPayAuthRepository(
      {
        getNonce: () =>
          Promise.resolve({
            success: true,
            data: { nonce: 'provider-nonce' },
          }),
        submitChallenge: (request: unknown, options: unknown) => {
          capturedRequest = request;
          capturedOptions = options;

          return Promise.resolve({
            success: true,
            data: { token: 'provider-token' },
          });
        },
      } as never,
      {
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/',
      }
    );

    const result = await repository.authenticate({
      message: 'message',
      signature: '0xsigned',
      siweCookie: 'siwe-session=test',
      walletAddress: '0x1234567890123456789012345678901234567890',
    });

    expect(result.isSuccess).toBe(true);
    expect(capturedRequest).toEqual({
      message: 'message',
      signature: '0xsigned',
      ttlInSeconds: 3600,
    });
    expect(capturedOptions).toEqual({
      siweCookie: 'siwe-session=test',
      origin: 'http://localhost:3000',
      referer: 'http://localhost:3000/',
    });
  });
});
