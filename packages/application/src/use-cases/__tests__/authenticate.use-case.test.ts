import { describe, test, expect, mock } from 'bun:test';
import { AuthenticateUseCase } from '../auth/authenticate.use-case';
import { Result } from '@payments-view/domain/shared';
import { ValidationError, ExternalServiceError } from '@payments-view/domain/shared';
import type { IAuthRepository } from '@payments-view/domain/identity';

describe('AuthenticateUseCase', () => {
  const validAddress = '0x1234567890123456789012345678901234567890';
  const validMessage = 'test message';
  const validSignature = 'test signature';
  const expiresAt = new Date(Date.now() + 3600000);

  test('should authenticate with valid input', async () => {
    const mockRepository: IAuthRepository = {
      getNonce: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
      authenticate: mock(() =>
        Promise.resolve(
          Result.ok({
            token: 'test-token',
            expiresAt,
          })
        )
      ),
    };

    const useCase = new AuthenticateUseCase(mockRepository);
    const result = await useCase.execute({
      walletAddress: validAddress,
      message: validMessage,
      signature: validSignature,
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.session).toBeDefined();
      expect(result.value.session.token).toBe('test-token');
      expect(result.value.session.walletAddress.value).toBe(validAddress.toLowerCase());
    }

    expect(mockRepository.authenticate).toHaveBeenCalledTimes(1);
    expect(mockRepository.authenticate).toHaveBeenCalledWith({
      message: validMessage,
      signature: validSignature,
      walletAddress: validAddress.toLowerCase(),
    });
  });

  test('should return validation error for invalid address', async () => {
    const mockRepository: IAuthRepository = {
      getNonce: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
      authenticate: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
    };

    const useCase = new AuthenticateUseCase(mockRepository);
    const result = await useCase.execute({
      walletAddress: 'invalid-address',
      message: validMessage,
      signature: validSignature,
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }

    expect(mockRepository.authenticate).not.toHaveBeenCalled();
  });

  test('should propagate authentication errors', async () => {
    const authError = new ExternalServiceError('auth', 'Authentication failed');
    const mockRepository: IAuthRepository = {
      getNonce: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
      authenticate: mock(() => Promise.resolve(Result.err(authError))),
    };

    const useCase = new AuthenticateUseCase(mockRepository);
    const result = await useCase.execute({
      walletAddress: validAddress,
      message: validMessage,
      signature: validSignature,
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBe(authError);
    }
  });

  test('should normalize address to lowercase', async () => {
    const upperAddress = validAddress.toUpperCase();
    const mockRepository: IAuthRepository = {
      getNonce: mock(() => Promise.resolve(Result.err(new ExternalServiceError('test', 'Not implemented')))),
      authenticate: mock(() =>
        Promise.resolve(
          Result.ok({
            token: 'test-token',
            expiresAt,
          })
        )
      ),
    };

    const useCase = new AuthenticateUseCase(mockRepository);
    const result = await useCase.execute({
      walletAddress: upperAddress,
      message: validMessage,
      signature: validSignature,
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.authenticate).toHaveBeenCalledWith(
      expect.objectContaining({
        walletAddress: validAddress.toLowerCase(),
      })
    );
  });
});

