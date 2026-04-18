import { afterEach, describe, expect, test } from 'bun:test';
import { createHmac } from 'crypto';

import { AUTH_CONFIG } from '@payments-view/constants';

import { parseAuthHeader } from '../auth.middleware';

const validAddress = '0x1234567890123456789012345678901234567890';
const originalEnv: {
  authJwtSecret: string | undefined;
  enableLocalJwtFallback: string | undefined;
  nodeEnv: NodeJS.ProcessEnv['NODE_ENV'];
} = {
  authJwtSecret: process.env.AUTH_JWT_SECRET,
  enableLocalJwtFallback: process.env.ENABLE_LOCAL_JWT_FALLBACK,
  nodeEnv: process.env.NODE_ENV,
};

const createLocalToken = (secret: string): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      signerAddress: validAddress,
      chainId: AUTH_CONFIG.CHAIN_ID,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    })
  ).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');

  return `${unsigned}.${signature}`;
};

afterEach(() => {
  if (typeof originalEnv.authJwtSecret === 'undefined') {
    Reflect.deleteProperty(process.env, 'AUTH_JWT_SECRET');
  } else {
    process.env.AUTH_JWT_SECRET = originalEnv.authJwtSecret;
  }

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

describe('parseAuthHeader', () => {
  test('rejects local JWTs when local fallback is disabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_JWT_SECRET = 'test-secret';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'false';

    const token = createLocalToken('test-secret');
    const session = parseAuthHeader(`Bearer ${token}`);

    expect(session).toBeNull();
  });

  test('accepts valid local JWTs only when local fallback is enabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_JWT_SECRET = 'test-secret';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'true';

    const token = createLocalToken('test-secret');
    const session = parseAuthHeader(`Bearer ${token}`);

    expect(session).not.toBeNull();
    expect(session?.walletAddress.value).toBe(validAddress.toLowerCase());
  });

  test('rejects invalid local JWT signatures even when local fallback is enabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_JWT_SECRET = 'expected-secret';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'true';

    const token = createLocalToken('different-secret');
    const session = parseAuthHeader(`Bearer ${token}`);

    expect(session).toBeNull();
  });
});
