import { z } from 'zod';
import { AuthenticateUseCase } from '@payments-view/application/use-cases';
import { GnosisPayAuthRepository } from '@payments-view/infrastructure';
import {
  AUTH_SESSION_COOKIE_NAMES,
  decodeJwt,
  getSessionCookieName,
  getSessionCookieOptions,
  isSessionTokenTooLarge,
} from '@payments-view/api';

import {
  buildNoStoreHeaders,
  createNoStoreJsonResponse,
  validateStateChangingRequest,
} from '@/lib/auth/security';

const authenticateSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  message: z.string().min(1, 'Message is required'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
});

const SIWE_SIGNIN_PREFIX = ' wants you to sign in with your Ethereum account:';

const extractSiweDomain = (message: string): string | null => {
  const firstLine = message.split('\n')[0];
  if (!firstLine) {
    return null;
  }

  const delimiterIndex = firstLine.indexOf(SIWE_SIGNIN_PREFIX);
  if (delimiterIndex <= 0) {
    return null;
  }

  return firstLine.slice(0, delimiterIndex).trim() || null;
};

const isLocalJwtFallbackEnabled = (): boolean =>
  process.env.NODE_ENV !== 'production' && process.env['ENABLE_LOCAL_JWT_FALLBACK'] === 'true';

/**
 * Complete SIWE auth flow and persist session as an HttpOnly cookie.
 */
export async function POST(request: Request): Promise<Response> {
  const invalidRequestReason = validateStateChangingRequest(request);
  if (invalidRequestReason) {
    return createNoStoreJsonResponse({ error: invalidRequestReason }, { status: 403 });
  }

  let parsedInput: z.infer<typeof authenticateSchema>;
  try {
    const body = await request.json();
    parsedInput = authenticateSchema.parse(body);
  } catch {
    return createNoStoreJsonResponse({ error: 'Invalid request payload' }, { status: 400 });
  }

  const authenticateUseCase = new AuthenticateUseCase(new GnosisPayAuthRepository());
  const authResult = await authenticateUseCase.execute({
    walletAddress: parsedInput.address,
    message: parsedInput.message,
    signature: parsedInput.signature,
  });

  if (authResult.isFailure) {
    const message = authResult.error.message;
    const isDomainRejected = /siwe domain not allowed/i.test(message);

    if (isDomainRejected) {
      const domain = extractSiweDomain(parsedInput.message);
      console.error(
        `[SIWE] Domain rejected by provider (${domain ?? 'unknown'}). Check SIWE_DOMAIN / SIWE_URI env vars.`
      );
    }

    return createNoStoreJsonResponse(
      { error: isDomainRejected ? 'Authentication failed. Please try again later.' : message },
      { status: isDomainRejected ? 500 : 401 }
    );
  }

  const session = authResult.value.session;
  const token = session.token;

  if (isSessionTokenTooLarge(token)) {
    return createNoStoreJsonResponse(
      { error: 'Session token is too large for cookie storage' },
      { status: 500 }
    );
  }

  const jwtPayload = decodeJwt(token);
  if (!jwtPayload?.userId && !isLocalJwtFallbackEnabled()) {
    const domain = extractSiweDomain(parsedInput.message);
    console.error(
      `[SIWE] JWT missing userId claim (domain: ${domain ?? 'unknown'}). The SIWE domain may not be accepted by the provider.`
    );
    return createNoStoreJsonResponse(
      { error: 'Authentication failed. Please try again later.' },
      { status: 500 }
    );
  }

  const cookieName = getSessionCookieName(request.url);
  const cookieOptions = getSessionCookieOptions(request.url, session.expiresAt);

  const response = createNoStoreJsonResponse(
    {
      walletAddress: session.walletAddress.value,
      expiresAt: session.expiresAt.toISOString(),
    },
    {
      status: 200,
      headers: buildNoStoreHeaders({ Vary: 'Cookie' }),
    }
  );

  response.cookies.set(cookieName, token, cookieOptions);

  // Clear any stale session cookie from alternate environments.
  for (const candidateCookieName of AUTH_SESSION_COOKIE_NAMES) {
    if (candidateCookieName === cookieName) {
      continue;
    }

    response.cookies.set(candidateCookieName, '', {
      ...cookieOptions,
      maxAge: 0,
      secure: candidateCookieName.startsWith('__Host-'),
    });
  }

  return response;
}
