import { z } from 'zod';
import { GetNonceUseCase, AuthenticateUseCase } from '@payments-view/application/use-cases';
import { GnosisPayAuthRepository } from '@payments-view/infrastructure/gnosis-pay';
import { SiweService } from '@payments-view/domain/identity';

import { router, publicProcedure, handleDomainError } from '../trpc';

/**
 * Input schema for generating SIWE message
 */
const generateSiweMessageSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  chainId: z.number().optional(),
});

/**
 * Input schema for authentication
 */
const authenticateSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  message: z.string().min(1, 'Message is required'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
});

/**
 * Auth tRPC router
 */
export const authRouter = router({
  /**
   * Get nonce for SIWE authentication
   */
  getNonce: publicProcedure.query(async () => {
    const authRepository = new GnosisPayAuthRepository();
    const useCase = new GetNonceUseCase(authRepository);

    const result = await useCase.execute();

    if (result.isFailure) {
      throw handleDomainError(result.error);
    }

    return result.value;
  }),

  /**
   * Generate SIWE message for signing
   */
  generateSiweMessage: publicProcedure
    .input(generateSiweMessageSchema)
    .mutation(async ({ input }) => {
      // First, get a nonce
      const authRepository = new GnosisPayAuthRepository();
      const getNonceUseCase = new GetNonceUseCase(authRepository);

      const nonceResult = await getNonceUseCase.execute();

      if (nonceResult.isFailure) {
        throw handleDomainError(nonceResult.error);
      }

      // Generate SIWE message
      const siweService = new SiweService();
      const message = siweService.createFormattedMessage({
        address: input.address,
        nonce: nonceResult.value.nonce,
        ...(input.chainId !== undefined && { chainId: input.chainId }),
      });

      return {
        message,
        nonce: nonceResult.value.nonce,
      };
    }),

  /**
   * Authenticate with SIWE signature
   */
  authenticate: publicProcedure.input(authenticateSchema).mutation(async ({ input }) => {
    const authRepository = new GnosisPayAuthRepository();
    const useCase = new AuthenticateUseCase(authRepository);

    const result = await useCase.execute({
      walletAddress: input.address,
      message: input.message,
      signature: input.signature,
    });

    if (result.isFailure) {
      throw handleDomainError(result.error);
    }

    // Return session data (without exposing the full session object)
    return {
      token: result.value.session.token,
      expiresAt: result.value.session.expiresAt.toISOString(),
      walletAddress: result.value.session.walletAddress.value,
    };
  }),
});

export type AuthRouter = typeof authRouter;

