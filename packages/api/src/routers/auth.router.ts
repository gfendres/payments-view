import { z } from 'zod';
import { AuthenticateUseCase, GetNonceUseCase } from '@payments-view/application/use-cases';
import { SiweService } from '@payments-view/domain/identity';
import { AUTH_CONFIG } from '@payments-view/constants';

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
 * Ensure URI has a protocol prefix (EIP-4361 requires a proper URI).
 * Handles the common misconfiguration of setting SIWE_URI to a bare hostname.
 */
const ensureUriProtocol = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

/**
 * Resolve SIWE domain/URI.
 *
 * Priority: SIWE_DOMAIN / SIWE_URI env vars → AUTH_CONFIG defaults.
 * The deployment hostname (request URL) is intentionally NOT used because
 * the Gnosis Pay-approved domain may differ from the Vercel deployment host.
 */
const resolveSiweOriginConfig = (): { domain: string; uri: string } => {
  const domain = process.env['SIWE_DOMAIN']?.trim() || AUTH_CONFIG.SIWE_DOMAIN;
  const rawUri = process.env['SIWE_URI']?.trim() || AUTH_CONFIG.SIWE_URI;

  return { domain, uri: ensureUriProtocol(rawUri) };
};

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
      const { domain, uri } = resolveSiweOriginConfig();
      const message = siweService.createFormattedMessage({
        address: input.address,
        nonce: nonceResult.value.nonce,
        domain,
        uri,
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
