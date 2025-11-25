/**
 * Gnosis Pay API response types
 */

/**
 * Nonce response from /api/v1/auth/nonce
 */
export interface NonceResponse {
  nonce: string;
}

/**
 * Challenge request payload for /api/v1/auth/challenge
 */
export interface ChallengeRequest {
  message: string;
  signature: string;
}

/**
 * Challenge response from /api/v1/auth/challenge
 */
export interface ChallengeResponse {
  jwt: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Generic API result wrapper
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorResponse };

