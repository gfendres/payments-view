import { afterEach, describe, expect, mock, test } from 'bun:test';
import { AUTH_CONFIG, API_CONFIG } from '@payments-view/constants';

import { GnosisPayAuthClient } from '../auth-client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('GnosisPayAuthClient.getNonce', () => {
  test('strips JSON quotes from the nonce response and preserves the SIWE cookie pair', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response('"quoted-nonce"', {
          status: 200,
          headers: {
            'set-cookie': 'siwe-session=test; Path=/; HttpOnly',
          },
        })
      )
    ) as unknown as typeof fetch;

    const client = new GnosisPayAuthClient();
    const result = await client.getNonce();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nonce).toBe('quoted-nonce');
      expect(result.data.siweCookie).toBe('siwe-session=test');
    }
  });
});

describe('GnosisPayAuthClient.submitChallenge', () => {
  test('uses fast-fail interactive auth options when submitting the SIWE challenge', async () => {
    const requestMock = mock(() =>
      Promise.resolve({
        success: true as const,
        data: {
          token: 'jwt-token',
        },
      })
    );

    const client = new GnosisPayAuthClient({
      request: requestMock,
    } as unknown as ConstructorParameters<typeof GnosisPayAuthClient>[0]);

    const result = await client.submitChallenge(
      {
        message: 'message',
        signature: 'signature',
      },
      {
        siweCookie: 'siwe-session=test',
        origin: 'https://www.financedashboard.app',
        referer: 'https://www.financedashboard.app/',
      }
    );

    expect(result.success).toBe(true);
    expect(requestMock).toHaveBeenCalledWith(API_CONFIG.GNOSIS_PAY.ENDPOINTS.AUTH_CHALLENGE, {
      method: 'POST',
      body: {
        message: 'message',
        signature: 'signature',
      },
      headers: {
        Cookie: 'siwe-session=test',
        Origin: 'https://www.financedashboard.app',
        Referer: 'https://www.financedashboard.app/',
      },
      timeout: AUTH_CONFIG.SIWE_CHALLENGE_TIMEOUT_MS,
      retries: AUTH_CONFIG.SIWE_CHALLENGE_MAX_RETRY_ATTEMPTS,
    });
  });
});
