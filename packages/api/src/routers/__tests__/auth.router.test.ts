import { afterEach, describe, expect, test } from 'bun:test';
import { Result } from '@payments-view/domain/shared';
import type { IAuthRepository } from '@payments-view/domain/identity';

import { createContext } from '../../context';
import { appRouter } from '../index';

const validAddress = '0x1234567890123456789012345678901234567890';
const originalNodeEnv: NodeJS.ProcessEnv['NODE_ENV'] = process.env.NODE_ENV;

const createAuthRepository = (): IAuthRepository => ({
  getNonce: () =>
    Promise.resolve(Result.ok({ nonce: 'test-nonce', siweCookie: 'siwe-session=test' })),
  authenticate: () =>
    Promise.resolve(
      Result.ok({
        token: 'test-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
    ),
});

const clearSiweEnv = () => {
  delete process.env['SIWE_DOMAIN'];
  delete process.env['SIWE_URI'];
};

afterEach(() => {
  clearSiweEnv();
  if (typeof originalNodeEnv === 'undefined') {
    Reflect.deleteProperty(process.env, 'NODE_ENV');
    return;
  }

  process.env.NODE_ENV = originalNodeEnv;
});

describe('authRouter.generateSiweMessage', () => {
  test('uses the incoming host and Gnosis Pay SIWE fields when generating the message', async () => {
    const caller = appRouter.createCaller(
      createContext({
        requestHeaders: new Headers({
          host: 'localhost:3000',
        }),
        repositories: {
          authRepository: createAuthRepository(),
        },
      })
    );

    const result = await caller.auth.generateSiweMessage({
      address: validAddress,
      chainId: 100,
    });

    const lines = result.message.split('\n');

    expect(lines[0]).toBe('localhost:3000 wants you to sign in with your Ethereum account:');
    expect(lines[1]).toBe(validAddress);
    expect(lines[2]).toBe('');
    expect(lines[3]).toBe('Sign in with Ethereum to Gnosis Pay');
    expect(lines[4]).toBe('');
    expect(lines[5]).toBe('URI: https://api.gnosispay.com/');
    expect(lines[6]).toBe('Version: 1');
    expect(lines[7]).toBe('Chain ID: 100');
    expect(lines[8]).toBe('Nonce: test-nonce');
    expect(lines[9]?.startsWith('Issued At: ')).toBe(true);
    expect(lines[9]).not.toContain('undefined');
    expect(result.siweCookie).toBe('siwe-session=test');
  });

  test('uses the configured production SIWE domain for non-local hosts', async () => {
    const caller = appRouter.createCaller(
      createContext({
        requestHeaders: new Headers({
          host: 'financedashboard.app',
        }),
        repositories: {
          authRepository: createAuthRepository(),
        },
      })
    );

    const result = await caller.auth.generateSiweMessage({
      address: validAddress,
      chainId: 100,
    });

    expect(result.message).toContain(
      'www.financedashboard.app wants you to sign in with your Ethereum account:'
    );
    expect(result.message).toContain('URI: https://api.gnosispay.com/');
  });
});
