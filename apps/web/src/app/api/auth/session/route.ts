import { AUTH_SESSION_COOKIE_NAMES, parseAuth } from '@payments-view/api';

import { createNoStoreJsonResponse } from '@/lib/auth/security';

/**
 * Resolve current authentication state from cookie-backed session.
 */
export async function GET(request: Request): Promise<Response> {
  const session = parseAuth({
    authHeader: request.headers.get('Authorization') ?? undefined,
    cookieHeader: request.headers.get('cookie') ?? undefined,
  });

  if (!session || session.isExpired) {
    const response = createNoStoreJsonResponse(
      {
        authenticated: false,
      },
      {
        status: 200,
        headers: { Vary: 'Cookie' },
      }
    );

    // Proactively clear stale auth cookies to recover from invalid sessions.
    for (const cookieName of AUTH_SESSION_COOKIE_NAMES) {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: cookieName.startsWith('__Host-'),
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }

    return response;
  }

  return createNoStoreJsonResponse(
    {
      authenticated: true,
      walletAddress: session.walletAddress.value,
      expiresAt: session.expiresAt.toISOString(),
    },
    {
      status: 200,
      headers: { Vary: 'Cookie' },
    }
  );
}
