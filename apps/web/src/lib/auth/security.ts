import { NextResponse } from 'next/server';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const AUTH_NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export const buildNoStoreHeaders = (initHeaders?: HeadersInit): Headers => {
  const headers = new Headers(initHeaders);
  for (const [key, value] of Object.entries(AUTH_NO_STORE_HEADERS)) {
    headers.set(key, value);
  }
  return headers;
};

export const createNoStoreJsonResponse = <T>(body: T, init: ResponseInit = {}): NextResponse => {
  const headers = buildNoStoreHeaders(init.headers);

  return NextResponse.json(body, {
    ...init,
    headers,
  });
};

export const createNoStoreResponse = (init: ResponseInit = {}): Response => {
  const headers = buildNoStoreHeaders(init.headers);

  return new Response(null, {
    ...init,
    headers,
  });
};

/**
 * Validate browser metadata for state-changing requests to reduce CSRF risk.
 */
export const validateStateChangingRequest = (request: Request): string | null => {
  if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const secFetchSite = request.headers.get('sec-fetch-site');

  if (origin) {
    if (origin !== requestOrigin) {
      return 'Invalid origin';
    }
  } else if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin !== requestOrigin) {
        return 'Invalid referer';
      }
    } catch {
      return 'Invalid referer';
    }
  } else {
    return 'Missing origin metadata';
  }

  if (secFetchSite && !['same-origin', 'same-site', 'none'].includes(secFetchSite)) {
    return 'Cross-site request blocked';
  }

  return null;
};
