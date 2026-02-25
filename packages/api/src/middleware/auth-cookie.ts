const SECURE_SESSION_COOKIE_NAME = '__Host-pv_session';
const DEV_SESSION_COOKIE_NAME = 'pv_session';
const MS_PER_SECOND = 1000;

const AUTH_COOKIE_MAX_BYTES = 3800;

/**
 * All session cookie names accepted by the API (ordered by preference)
 */
export const AUTH_SESSION_COOKIE_NAMES = [SECURE_SESSION_COOKIE_NAME, DEV_SESSION_COOKIE_NAME] as const;

/**
 * Parse cookie header into a key-value map.
 */
const parseCookieHeader = (cookieHeader?: string): Map<string, string> => {
  const cookieMap = new Map<string, string>();

  if (!cookieHeader) {
    return cookieMap;
  }

  for (const cookiePart of cookieHeader.split(';')) {
    const trimmed = cookiePart.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    cookieMap.set(key, decodeURIComponent(value));
  }

  return cookieMap;
};

/**
 * Resolve the session token from cookies.
 */
export const extractTokenFromCookieHeader = (cookieHeader?: string): string | null => {
  const cookieMap = parseCookieHeader(cookieHeader);

  for (const cookieName of AUTH_SESSION_COOKIE_NAMES) {
    const token = cookieMap.get(cookieName);
    if (token) {
      return token;
    }
  }

  return null;
};

/**
 * Use __Host- cookie on secure origins, fallback cookie name otherwise.
 */
export const getSessionCookieName = (requestUrl: string): string => {
  try {
    const { protocol } = new URL(requestUrl);
    return protocol === 'https:' ? SECURE_SESSION_COOKIE_NAME : DEV_SESSION_COOKIE_NAME;
  } catch {
    return DEV_SESSION_COOKIE_NAME;
  }
};

/**
 * Build options for setting the session cookie.
 */
export const getSessionCookieOptions = (
  requestUrl: string,
  expiresAt: Date
): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
} => {
  const secure = getSessionCookieName(requestUrl) === SECURE_SESSION_COOKIE_NAME;
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / MS_PER_SECOND));

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  };
};

/**
 * Estimate if token likely exceeds safe cookie size budget.
 */
export const isSessionTokenTooLarge = (token: string): boolean => {
  return token.length > AUTH_COOKIE_MAX_BYTES;
};
