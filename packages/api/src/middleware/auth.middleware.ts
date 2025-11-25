import { Session } from '@payments-view/domain/identity';
import { EthereumAddress } from '@payments-view/domain/transaction';

/**
 * JWT payload structure (simplified - in production use proper JWT library)
 */
interface JwtPayload {
  sub: string; // wallet address
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

/**
 * Extract token from Authorization header
 */
export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] ?? null;
};

/**
 * Decode JWT payload (simplified - does not verify signature)
 * In production, use a proper JWT library to verify the signature
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Base64url decode
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Create session from JWT token
 */
export const createSessionFromToken = (token: string): Session | null => {
  const payload = decodeJwt(token);

  if (!payload) {
    return null;
  }

  // Check expiration
  const expiresAt = new Date(payload.exp * 1000);
  if (expiresAt <= new Date()) {
    return null;
  }

  // Create ethereum address
  const addressResult = EthereumAddress.create(payload.sub);
  if (addressResult.isFailure) {
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

  return createSessionFromToken(token);
};

