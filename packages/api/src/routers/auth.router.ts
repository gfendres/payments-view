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

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeSiweDomain = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  // Accept accidental URL input and extract hostname.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).hostname.toLowerCase();
    } catch {
      // fall through to lightweight normalization below
    }
  }

  const withoutPath = trimmed.replace(/\/.*$/, '');
  return withoutPath.toLowerCase();
};

const normalizeSiweUri = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    // Use origin to avoid trailing slash/path mismatches.
    return new URL(trimmed).origin;
  } catch {
    // Best-effort fallback if value is malformed.
    return trimmed.replace(/\/+$/, '');
  }
};

/**
 * Resolve SIWE domain/URI with environment overrides and safe request-based fallback.
 */
const resolveSiweOriginConfig = (
  requestUrl?: string
): {
  domain: string;
  uri: string;
} => {
  const configuredDomain = normalizeSiweDomain(process.env['SIWE_DOMAIN']);
  const configuredUri = normalizeSiweUri(process.env['SIWE_URI']);

  let uri = configuredUri || AUTH_CONFIG.SIWE_URI;
  let domain = configuredDomain || AUTH_CONFIG.SIWE_DOMAIN;

  if (!configuredDomain || !configuredUri) {
    if (requestUrl) {
      try {
        const parsedUrl = new URL(requestUrl);
        const isLocalHost = LOCAL_HOSTNAMES.has(parsedUrl.hostname);

        if (!isLocalHost) {
          if (!configuredUri) {
            uri = parsedUrl.origin;
          }
          if (!configuredDomain) {
            domain = parsedUrl.hostname;
          }
        }
      } catch {
        // no-op: keep defaults
      }
    }

    if (!configuredDomain) {
      try {
        domain = new URL(uri).hostname || domain;
      } catch {
        // no-op: keep resolved domain
      }
    }
  }

  return {
    domain: normalizeSiweDomain(domain) || AUTH_CONFIG.SIWE_DOMAIN,
    uri: normalizeSiweUri(uri) || AUTH_CONFIG.SIWE_URI,
  };
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
      const { domain, uri } = resolveSiweOriginConfig(ctx.requestUrl);
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
