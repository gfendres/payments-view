import { describe, expect, test } from 'bun:test';

import { hasProviderUserIdClaim } from '../token';

const createToken = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
};

describe('hasProviderUserIdClaim', () => {
  test('returns true when the token payload includes a userId claim', () => {
    const token = createToken({ userId: 'gp_user_123', signerAddress: '0x123' });

    expect(hasProviderUserIdClaim(token)).toBe(true);
  });

  test('returns false for local fallback tokens without a userId claim', () => {
    const token = createToken({ signerAddress: '0x123', chainId: 100 });

    expect(hasProviderUserIdClaim(token)).toBe(false);
  });

  test('returns false for malformed tokens', () => {
    expect(hasProviderUserIdClaim('not-a-jwt')).toBe(false);
  });
});
