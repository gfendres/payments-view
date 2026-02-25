import { describe, expect, test } from 'bun:test';

import {
  extractTokenFromCookieHeader,
  getSessionCookieName,
  getSessionCookieOptions,
  isSessionTokenTooLarge,
} from '../auth-cookie';
import { parseAuth } from '../auth.middleware';

const createJwtLikeToken = (walletAddress: string): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    userId: 'user-1',
    signerAddress: walletAddress,
    chainId: 100,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
  };

  const headerEncoded = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
    'base64url'
  );
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${headerEncoded}.${payloadEncoded}.signature`;
};

const createLocalJwtLikeToken = (walletAddress: string): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    signerAddress: walletAddress,
    chainId: 100,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
  };

  const headerEncoded = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
    'base64url'
  );
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${headerEncoded}.${payloadEncoded}.signature`;
};

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
    const secureOptions = getSessionCookieOptions('https://payments-view.app/api/auth/siwe', expiresAt);
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
    const cookieToken = createJwtLikeToken('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const headerToken = createJwtLikeToken('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

    const session = parseAuth({
      cookieHeader: `__Host-pv_session=${cookieToken}`,
      authHeader: `Bearer ${headerToken}`,
    });

    expect(session).not.toBeNull();
    expect(session?.walletAddress.value).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  test('falls back to Authorization header when cookie is absent', () => {
    const headerToken = createJwtLikeToken('0xcccccccccccccccccccccccccccccccccccccccc');

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

  test('rejects local tokens without userId by default', () => {
    const token = createLocalJwtLikeToken('0xdddddddddddddddddddddddddddddddddddddddd');
    const session = parseAuth({
      cookieHeader: `__Host-pv_session=${token}`,
    });

    expect(session).toBeNull();
  });

  test('allows local tokens when ENABLE_LOCAL_JWT_FALLBACK is true', () => {
    const previous = process.env['ENABLE_LOCAL_JWT_FALLBACK'];
    process.env['ENABLE_LOCAL_JWT_FALLBACK'] = 'true';

    try {
      const token = createLocalJwtLikeToken('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
      const session = parseAuth({
        cookieHeader: `__Host-pv_session=${token}`,
      });

      expect(session).not.toBeNull();
      expect(session?.walletAddress.value).toBe('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    } finally {
      if (previous === undefined) {
        delete process.env['ENABLE_LOCAL_JWT_FALLBACK'];
      } else {
        process.env['ENABLE_LOCAL_JWT_FALLBACK'] = previous;
      }
    }
  });
});
