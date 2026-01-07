import { z } from 'zod';
import { AuthenticateUseCase, GetNonceUseCase } from '@payments-view/application/use-cases';
import { SiweService } from '@payments-view/domain/identity';

import { handleDomainError, publicProcedure, router } from '../trpc';

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
  getNonce: publicProcedure.query(async ({ ctx }) => {
    const useCase = new GetNonceUseCase(ctx.repositories.authRepository);

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
    .mutation(async ({ ctx, input }) => {
      // First, get a nonce
      const getNonceUseCase = new GetNonceUseCase(ctx.repositories.authRepository);

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
  authenticate: publicProcedure.input(authenticateSchema).mutation(async ({ ctx, input }) => {
    const useCase = new AuthenticateUseCase(ctx.repositories.authRepository);

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
