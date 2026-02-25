import { NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE_NAMES } from '@payments-view/api';

import {
  buildNoStoreHeaders,
  createNoStoreJsonResponse,
  validateStateChangingRequest,
} from '@/lib/auth/security';

/**
 * Clear server-side auth cookies for the current client context.
 */
export async function POST(request: Request): Promise<Response> {
  const invalidRequestReason = validateStateChangingRequest(request);
  if (invalidRequestReason) {
    return createNoStoreJsonResponse({ error: invalidRequestReason }, { status: 403 });
  }

  const response = new NextResponse(null, {
    status: 204,
    headers: buildNoStoreHeaders({ Vary: 'Cookie' }),
  });

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
