import { afterEach, describe, expect, mock, test } from 'bun:test';

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
