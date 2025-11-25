import { API_CONFIG } from '@payments-view/constants';

import { GnosisPayClient } from './client';
import type {
  NonceResponse,
  ChallengeRequest,
  ChallengeResponse,
  ApiResult,
} from './types';

/**
 * Gnosis Pay authentication client
 */
export class GnosisPayAuthClient {
  private readonly client: GnosisPayClient;

  constructor(client?: GnosisPayClient) {
    this.client = client ?? new GnosisPayClient();
  }

  /**
   * Get a nonce for SIWE authentication
   */
  async getNonce(): Promise<ApiResult<NonceResponse>> {
    return this.client.request<NonceResponse>(API_CONFIG.GNOSIS_PAY.ENDPOINTS.AUTH_NONCE);
  }

  /**
   * Submit SIWE challenge to get JWT
   */
  async submitChallenge(request: ChallengeRequest): Promise<ApiResult<ChallengeResponse>> {
    return this.client.request<ChallengeResponse>(
      API_CONFIG.GNOSIS_PAY.ENDPOINTS.AUTH_CHALLENGE,
      {
        method: 'POST',
        body: request,
      }
    );
  }
}

