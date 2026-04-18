/**
 * Gnosis Pay API response types
 */

/**
 * Nonce response from /api/v1/auth/nonce
 */
export interface NonceResponse {
  nonce: string;
  siweCookie?: string;
}

/**
 * Challenge request payload for /api/v1/auth/challenge
 */
export interface ChallengeRequest {
  message: string;
  signature: string;
  ttlInSeconds?: number;
}

export interface ChallengeRequestOptions {
  siweCookie?: string;
  origin?: string;
  referer?: string;
}

/**
 * Challenge response from /api/v1/auth/challenge
 * Note: API returns 'token' not 'jwt' as per docs
 */
export interface ChallengeResponse {
  token: string;
}

export type { ApiErrorResponse, ApiResult } from '../http/types';

// Re-export transaction and rewards types
export * from './types/index';
