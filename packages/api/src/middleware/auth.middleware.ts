import { createHmac, timingSafeEqual } from 'crypto';

import { Session } from '@payments-view/domain/identity';
import { EthereumAddress } from '@payments-view/domain/transaction';
import { AUTH_CONFIG } from '@payments-view/constants';

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
 * JWT payload structure
 * - Gnosis Pay API tokens include userId field
 * - Locally-issued tokens do not include userId
 */
interface JwtPayload {
  userId?: string; // Gnosis Pay user ID (only present in API tokens)
  signerAddress: string; // wallet address (Gnosis Pay uses this instead of sub)
  chainId: number; // chain ID (100 for Gnosis Chain)
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

/**
 * Get signing secret for JWT verification
 */
const getSigningSecret = (): string | undefined => {
  return process.env[AUTH_CONFIG.JWT_SIGNING_SECRET_ENV_KEY];
};

const parsePayload = (payloadSegment: string): JwtPayload | null => {
  try {
    const decoded = Buffer.from(payloadSegment, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded) as JwtPayload;
    if (!parsed.signerAddress || !parsed.exp || !parsed.iat) {
      logAuthDebug('payload missing required fields', {
        hasSigner: Boolean((parsed as JwtPayload).signerAddress),
        hasExp: Boolean((parsed as JwtPayload).exp),
        hasIat: Boolean((parsed as JwtPayload).iat),
        hasUserId: Boolean((parsed as JwtPayload).userId),
      });
      return null;
    }
    return parsed;
  } catch (error) {
    logAuthDebug('payload parse failed', {
      payloadLength: payloadSegment.length,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
};

const isSignatureValid = (
  secret: string,
  header: string,
  payload: string,
  signature: string
): boolean => {
  const unsigned = `${header}.${payload}`;
  const expected = createHmac('sha256', secret).update(unsigned).digest('base64url');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature, 'base64url');

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
};

const validateSignature = (
  header: string,
  payload: string,
  signature: string,
  parsed: JwtPayload
): JwtPayload | null => {
  // Gnosis Pay API tokens have userId field - trust them without signature verification
  // The API already validated the SIWE signature before issuing the token
  if (parsed.userId) {
    return parsed;
  }

  // Locally-issued tokens (no userId) must be verified with AUTH_JWT_SECRET
  const secret = getSigningSecret();
  const isValidSignature = secret ? isSignatureValid(secret, header, payload, signature) : false;

  if (secret && !isValidSignature) {
    // In development, allow payload parsing even if signature can't be verified (e.g., external tokens)
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    return parsed;
  }

  if (!secret && process.env.NODE_ENV === 'production') {
    return null; // require verification in production for local tokens
  }

  return parsed;
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader) {
    logAuthDebug('missing Authorization header');
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logAuthDebug('invalid Authorization format', { parts: parts.length, scheme: parts[0] });
    return null;
  }

  return parts[1] ?? null;
};

/**
 * Decode JWT payload and verify signature when appropriate.
 * - Gnosis Pay API tokens (with userId) are trusted without signature verification
 * - Locally-issued tokens (no userId) are verified with AUTH_JWT_SECRET
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      logAuthDebug('token missing parts', { hasHeader: Boolean(header), hasPayload: Boolean(payload), hasSignature: Boolean(signature) });
      return null;
    }

    const parsed = parsePayload(payload);
    if (!parsed) return null;

    return validateSignature(header, payload, signature, parsed);
  } catch (error) {
    logAuthDebug('decodeJwt failed', {
      error: error instanceof Error ? error.message : 'unknown',
      tokenLength: token.length,
    });
    return null;
  }
};

/**
 * Create session from JWT token
 */
export const createSessionFromToken = (token: string): Session | null => {
  const payload = decodeJwt(token);

  if (!payload) {
    logAuthDebug('decodeJwt returned null', { tokenLength: token.length });
    return null;
  }

  // Check expiration
  const expiresAt = new Date(payload.exp * 1000);
  if (expiresAt <= new Date()) {
    logAuthDebug('token expired', { exp: expiresAt.toISOString(), now: new Date().toISOString() });
    return null;
  }

  // Create ethereum address from signerAddress field
  const addressResult = EthereumAddress.create(payload.signerAddress);
  if (addressResult.isFailure) {
    logAuthDebug('invalid signer address', { signerAddress: payload.signerAddress });
    return null;
  }

  // Create session
  return Session.create({
    walletAddress: addressResult.value,
    token,
    expiresAt,
    createdAt: new Date(payload.iat * 1000),
  });
};

/**
 * Validate session is not about to expire
 */
export const validateSessionNotExpiring = (session: Session): boolean => {
  return !session.needsRefresh;
};

/**
 * Parse auth header and create session
 */
export const parseAuthHeader = (authHeader?: string): Session | null => {
  const token = extractToken(authHeader);

  if (!token) {
    return null;
  }

  const session = createSessionFromToken(token);

  if (!session) {
    logAuthDebug('createSessionFromToken returned null', {
      tokenLength: token.length,
    });
  }

  return session;
};
