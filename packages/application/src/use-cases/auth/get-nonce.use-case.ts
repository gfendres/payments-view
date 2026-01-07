import type { DomainError, Result } from '@payments-view/domain/shared';
import type { IAuthRepository, NonceResult } from '@payments-view/domain/identity';

/**
 * Get nonce use case output
 */
export type GetNonceOutput = NonceResult;

/**
 * Get Nonce Use Case
 * Retrieves a nonce from the auth provider for SIWE authentication
 */
export class GetNonceUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Execute the use case
   */
  async execute(): Promise<Result<GetNonceOutput, DomainError>> {
    return await this.authRepository.getNonce();
  }
}

