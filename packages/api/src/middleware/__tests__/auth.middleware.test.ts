import { afterEach, describe, expect, test } from 'bun:test';
import { createHmac } from 'crypto';

import { AUTH_CONFIG } from '@payments-view/constants';

import {
  extractTokenFromCookieHeader,
  getSessionCookieName,
  getSessionCookieOptions,
  isSessionTokenTooLarge,
} from '../auth-cookie';
import { parseAuth, parseAuthHeader } from '../auth.middleware';

const validAddress = '0x1234567890123456789012345678901234567890';
const originalEnv: {
  allowLocalJwtSession: string | undefined;
  authJwtSecret: string | undefined;
  enableLocalJwtFallback: string | undefined;
  nodeEnv: NodeJS.ProcessEnv['NODE_ENV'];
} = {
  allowLocalJwtSession: process.env['ALLOW_LOCAL_JWT_SESSION'],
  authJwtSecret: process.env.AUTH_JWT_SECRET,
  enableLocalJwtFallback: process.env.ENABLE_LOCAL_JWT_FALLBACK,
  nodeEnv: process.env.NODE_ENV,
};

const createProviderToken = (walletAddress: string): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    userId: 'user-1',
    signerAddress: walletAddress,
    chainId: AUTH_CONFIG.CHAIN_ID,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
  };

  const headerEncoded = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
    'base64url'
  );
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${headerEncoded}.${payloadEncoded}.signature`;
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
  if (typeof originalEnv.allowLocalJwtSession === 'undefined') {
    Reflect.deleteProperty(process.env, 'ALLOW_LOCAL_JWT_SESSION');
  } else {
    process.env['ALLOW_LOCAL_JWT_SESSION'] = originalEnv.allowLocalJwtSession;
  }

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

describe('auth cookie helpers', () => {
  test('extractTokenFromCookieHeader prioritizes secure cookie name', () => {
    const tokenA = 'token-a';
    const tokenB = 'token-b';
    const cookieHeader = `pv_session=${tokenA}; __Host-pv_session=${tokenB}`;

    expect(extractTokenFromCookieHeader(cookieHeader)).toBe(tokenB);
  });

  test('getSessionCookieName returns host-prefixed name for https', () => {
    expect(getSessionCookieName('https://payments-view.app/api/auth/session')).toBe(
      '__Host-pv_session'
    );
  });

  test('getSessionCookieName returns fallback name for http', () => {
    expect(getSessionCookieName('http://localhost:3000/api/auth/session')).toBe('pv_session');
  });

  test('getSessionCookieOptions computes secure and maxAge', () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const secureOptions = getSessionCookieOptions(
      'https://payments-view.app/api/auth/siwe',
      expiresAt
    );
    const devOptions = getSessionCookieOptions('http://localhost:3000/api/auth/siwe', expiresAt);

    expect(secureOptions.secure).toBe(true);
    expect(devOptions.secure).toBe(false);
    expect(secureOptions.httpOnly).toBe(true);
    expect(secureOptions.sameSite).toBe('lax');
    expect(secureOptions.path).toBe('/');
    expect(secureOptions.maxAge).toBeGreaterThan(0);
  });

  test('isSessionTokenTooLarge detects oversized values', () => {
    expect(isSessionTokenTooLarge('x'.repeat(4000))).toBe(true);
    expect(isSessionTokenTooLarge('x'.repeat(500))).toBe(false);
  });
});

describe('parseAuth', () => {
  test('prefers cookie token over Authorization header token', () => {
    const cookieToken = createProviderToken('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const headerToken = createProviderToken('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

    const session = parseAuth({
      cookieHeader: `__Host-pv_session=${cookieToken}`,
      authHeader: `Bearer ${headerToken}`,
    });

    expect(session).not.toBeNull();
    expect(session?.walletAddress.value).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  test('falls back to Authorization header when cookie is absent', () => {
    const headerToken = createProviderToken('0xcccccccccccccccccccccccccccccccccccccccc');

    const session = parseAuth({
      authHeader: `Bearer ${headerToken}`,
    });

    expect(session).not.toBeNull();
    expect(session?.walletAddress.value).toBe('0xcccccccccccccccccccccccccccccccccccccccc');
  });

  test('returns null when no credentials are present', () => {
    const session = parseAuth({});
    expect(session).toBeNull();
  });

  test('rejects local tokens without an enabled development fallback', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_JWT_SECRET = 'test-secret';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'false';

    const token = createLocalToken('test-secret');
    const session = parseAuth({
      cookieHeader: `__Host-pv_session=${token}`,
    });

    expect(session).toBeNull();
  });

  test('allows local cookie sessions when development fallback is enabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_JWT_SECRET = 'test-secret';
    process.env.ENABLE_LOCAL_JWT_FALLBACK = 'true';

    const token = createLocalToken('test-secret');
    const session = parseAuth({
      cookieHeader: `__Host-pv_session=${token}`,
    });

    expect(session).not.toBeNull();
    expect(session?.walletAddress.value).toBe(validAddress.toLowerCase());
  });
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
