import { API_CONFIG, AUTH_CONFIG, REQUEST_TIMEOUT_MS } from '@payments-view/constants';

import { GnosisPayClient } from './client';
import type {
  ApiResult,
  ChallengeRequest,
  ChallengeRequestOptions,
  ChallengeResponse,
  NonceResponse,
} from './types';

const extractCookiePair = (setCookieHeader: string | null): string | undefined => {
  const cookiePair = setCookieHeader?.split(';')[0]?.trim();
  return cookiePair ?? undefined;
};

const normalizeNonce = (value: string): string => {
  return value.trim().replace(/^"+|"+$/g, '');
};

/**
 * Gnosis Pay authentication client
 */
export class GnosisPayAuthClient {
  private readonly client: GnosisPayClient;
  private readonly baseUrl: string;

  constructor(client?: GnosisPayClient) {
    this.client = client ?? new GnosisPayClient();
    this.baseUrl = API_CONFIG.GNOSIS_PAY.BASE_URL;
  }

  /**
   * Get a nonce for SIWE authentication
   * Note: The nonce endpoint returns plain text, not JSON
   */
  async getNonce(): Promise<ApiResult<NonceResponse>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.GNOSIS_PAY.ENDPOINTS.AUTH_NONCE}`,
        {
          method: 'GET',
          headers: { Accept: 'text/plain' },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            error: 'NONCE_ERROR',
            message: `Failed to get nonce: ${response.statusText}`,
            statusCode: response.status,
          },
        };
      }

      // The nonce endpoint returns plain text
      const nonce = await response.text();
      const siweCookie = extractCookiePair(response.headers.get('set-cookie'));

      return {
        success: true,
        data: {
          nonce: normalizeNonce(nonce),
          ...(siweCookie ? { siweCookie } : {}),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get nonce',
        },
      };
    }
  }

  /**
   * Submit SIWE challenge to get JWT
   */
  async submitChallenge(
    request: ChallengeRequest,
    options: ChallengeRequestOptions = {}
  ): Promise<ApiResult<ChallengeResponse>> {
    const headers: Record<string, string> = {};

    if (options.siweCookie) {
      headers['Cookie'] = options.siweCookie;
    }

    if (options.origin) {
      headers['Origin'] = options.origin;
    }

    if (options.referer) {
      headers['Referer'] = options.referer;
    }

    const result = await this.client.request<ChallengeResponse>(
      API_CONFIG.GNOSIS_PAY.ENDPOINTS.AUTH_CHALLENGE,
      {
        method: 'POST',
        body: request,
        headers,
        timeout: AUTH_CONFIG.SIWE_CHALLENGE_TIMEOUT_MS,
        retries: AUTH_CONFIG.SIWE_CHALLENGE_MAX_RETRY_ATTEMPTS,
      }
    );

    return result;
  }
}
