import { Result } from '@payments-view/domain/shared';
import type { DomainError, ValidationError } from '@payments-view/domain/shared';
import { Session } from '@payments-view/domain/identity';
import { EthereumAddress } from '@payments-view/domain/transaction';
import type { IAuthRepository } from '@payments-view/domain/identity';

/**
 * Authenticate use case input
 */
export interface AuthenticateInput {
  walletAddress: string;
  message: string;
  signature: string;
}

/**
 * Authenticate use case output
 */
export interface AuthenticateOutput {
  session: Session;
}

/**
 * Authenticate Use Case
 * Handles SIWE authentication flow and creates a session
 */
export class AuthenticateUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Execute the use case
   */
  async execute(
    input: AuthenticateInput
  ): Promise<Result<AuthenticateOutput, DomainError | ValidationError>> {
    // Validate and create ethereum address value object
    const addressResult = EthereumAddress.create(input.walletAddress);
    if (addressResult.isFailure) {
      return Result.err(addressResult.error);
    }

    // Submit challenge to get JWT
    const authResult = await this.authRepository.authenticate({
      message: input.message,
      signature: input.signature,
    });

    if (authResult.isFailure) {
      return Result.err(authResult.error);
    }

    // Create session entity
    const session = Session.create({
      walletAddress: addressResult.value,
      token: authResult.value.token,
      expiresAt: authResult.value.expiresAt,
      createdAt: new Date(),
    });

    return Result.ok({ session });
  }
}

