import { describe, expect, test } from 'bun:test';

import { POST as postSiwe } from '../siwe/route';
import { GET as getSession } from '../session/route';
import { POST as postLogout } from '../logout/route';

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

describe('auth routes', () => {
  test('siwe POST rejects state-changing requests without origin metadata', async () => {
    const request = new Request('https://payments-view.app/api/auth/siwe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        message: 'message',
        signature: '0xabc',
      }),
    });

    const response = await postSiwe(request);
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(403);
    expect(body.error).toBe('Missing origin metadata');
  });

  test('session GET resolves authenticated response from Authorization header fallback', async () => {
    const token = createJwtLikeToken('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    const request = new Request('https://payments-view.app/api/auth/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await getSession(request);
    const body = (await response.json()) as {
      authenticated: boolean;
      walletAddress?: string;
      expiresAt?: string;
    };

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(true);
    expect(body.walletAddress).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    expect(typeof body.expiresAt).toBe('string');
  });

  test('session GET clears stale auth cookies when unauthenticated', async () => {
    const request = new Request('https://payments-view.app/api/auth/session', {
      method: 'GET',
    });

    const response = await getSession(request);
    const body = (await response.json()) as { authenticated: boolean };
    const setCookieHeader = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(false);
    expect(setCookieHeader).toContain('__Host-pv_session=');
    expect(setCookieHeader).toContain('pv_session=');
  });

  test('logout POST clears both supported auth cookies', async () => {
    const request = new Request('https://payments-view.app/api/auth/logout', {
      method: 'POST',
      headers: {
        Origin: 'https://payments-view.app',
        'Sec-Fetch-Site': 'same-origin',
      },
    });

    const response = await postLogout(request);
    const setCookieHeader = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(204);
    expect(setCookieHeader).toContain('__Host-pv_session=');
    expect(setCookieHeader).toContain('pv_session=');
  });
});
