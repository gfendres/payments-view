/**
 * Gnosis Pay JWTs include a provider-issued user identifier.
 * Locally generated fallback tokens do not.
 */
const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

export const hasProviderUserIdClaim = (token: string): boolean => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return false;
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as { userId?: unknown };
    return typeof parsed.userId === 'string' && parsed.userId.length > 0;
  } catch {
    return false;
  }
};
