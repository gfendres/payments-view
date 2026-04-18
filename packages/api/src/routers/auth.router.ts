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
  siweCookie: z.string().min(1).optional(),
  debug: z
    .object({
      clientSignatureValid: z.boolean().optional(),
      recoveredAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
      signatureLength: z.number().int().positive().optional(),
      clientVerificationError: z.string().min(1).optional(),
    })
    .optional(),
});

const resolveRequestHost = (headers?: Headers, requestUrl?: string): string => {
  const forwardedHost = headers?.get('x-forwarded-host')?.trim();
  if (forwardedHost) {
    return forwardedHost;
  }

  const host = headers?.get('host')?.trim();
  if (host) {
    return host;
  }

  if (requestUrl) {
    return new URL(requestUrl).host;
  }

  return AUTH_CONFIG.SIWE_DOMAIN;
};

const logAuthDebug = (message: string, details: Record<string, unknown> = {}): void => {
  if (process.env.LOG_AUTH_DEBUG !== 'true') {
    return;
  }

  console.warn(
    JSON.stringify({
      level: 'warn',
      message: `[auth-debug] ${message}`,
      timestamp: new Date().toISOString(),
      ...details,
    })
  );
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
      const domain = resolveRequestHost(ctx.requestHeaders, ctx.requestUrl);
      const uri = AUTH_CONFIG.SIWE_URI;
      logAuthDebug('generating SIWE message', {
        address: input.address,
        chainId: input.chainId ?? AUTH_CONFIG.CHAIN_ID,
        domain,
        uri,
        siweCookiePresent: Boolean(nonceResult.value.siweCookie),
      });
      const message = siweService.createFormattedMessage({
        address: input.address,
        nonce: nonceResult.value.nonce,
        domain,
        uri,
        statement: AUTH_CONFIG.SIWE_STATEMENT,
        ...(input.chainId !== undefined && { chainId: input.chainId }),
      });

      return {
        message,
        nonce: nonceResult.value.nonce,
        siweCookie: nonceResult.value.siweCookie,
      };
    }),

  /**
   * Authenticate with SIWE signature
   */
  authenticate: publicProcedure.input(authenticateSchema).mutation(async ({ ctx, input }) => {
    logAuthDebug('received SIWE authentication payload', {
      address: input.address,
      messageLength: input.message.length,
      signatureLength: input.signature.length,
      clientSignatureValid: input.debug?.clientSignatureValid,
      recoveredAddress: input.debug?.recoveredAddress,
      clientVerificationError: input.debug?.clientVerificationError,
      clientSignatureLength: input.debug?.signatureLength,
      siweCookiePresent: Boolean(input.siweCookie),
    });

    const useCase = new AuthenticateUseCase(ctx.repositories.authRepository);

    const result = await useCase.execute({
      walletAddress: input.address,
      message: input.message,
      signature: input.signature,
      ...(input.siweCookie ? { siweCookie: input.siweCookie } : {}),
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
