import { afterEach, describe, expect, test } from 'bun:test';

import {
  resolveSiweChallengeRequestContext,
  resolveSiweMessageConfig,
} from '../siwe-origin';

const originalSiweDomain = process.env['SIWE_DOMAIN'];
const originalSiweUri = process.env['SIWE_URI'];

afterEach(() => {
  if (typeof originalSiweDomain === 'undefined') {
    Reflect.deleteProperty(process.env, 'SIWE_DOMAIN');
  } else {
    process.env['SIWE_DOMAIN'] = originalSiweDomain;
  }

  if (typeof originalSiweUri === 'undefined') {
    Reflect.deleteProperty(process.env, 'SIWE_URI');
  } else {
    process.env['SIWE_URI'] = originalSiweUri;
  }
});

describe('resolveSiweMessageConfig', () => {
  test('uses the configured SIWE domain for non-local hosts', () => {
    const result = resolveSiweMessageConfig(
      new Headers({
        host: 'financedashboard.app',
      })
    );

    expect(result).toEqual({
      domain: 'www.financedashboard.app',
      uri: 'https://api.gnosispay.com/',
    });
  });

  test('uses the request host for local development', () => {
    const result = resolveSiweMessageConfig(
      new Headers({
        host: 'localhost:3000',
      })
    );

    expect(result).toEqual({
      domain: 'localhost:3000',
      uri: 'https://api.gnosispay.com/',
    });
  });
});

describe('resolveSiweChallengeRequestContext', () => {
  test('canonicalizes non-local origin metadata to the configured SIWE domain', () => {
    const result = resolveSiweChallengeRequestContext(
      new Headers({
        host: 'financedashboard.app',
        origin: 'https://financedashboard.app',
        referer: 'https://financedashboard.app/',
      }),
      'https://financedashboard.app/api/auth/siwe'
    );

    expect(result).toEqual({
      origin: 'https://www.financedashboard.app',
      referer: 'https://www.financedashboard.app/',
    });
  });

  test('preserves local browser metadata for localhost flows', () => {
    const result = resolveSiweChallengeRequestContext(
      new Headers({
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/',
      }),
      'http://localhost:3000/api/auth/siwe'
    );

    expect(result).toEqual({
      origin: 'http://localhost:3000',
      referer: 'http://localhost:3000/',
    });
  });
});
