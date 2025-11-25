import { API_CONFIG } from '@payments-view/constants';

import { GnosisPayClient } from './client';
import type { ApiRewardsResponse } from './types';
import type { ApiResult } from './types';

/**
 * Gnosis Pay rewards API client
 */
export class GnosisPayRewardsClient {
  private readonly client: GnosisPayClient;

  constructor(client?: GnosisPayClient) {
    this.client = client ?? new GnosisPayClient();
  }

  /**
   * Get rewards information
   */
  async getRewards(token: string): Promise<ApiResult<ApiRewardsResponse>> {
    return this.client.request<ApiRewardsResponse>(
      API_CONFIG.GNOSIS_PAY.ENDPOINTS.REWARDS,
      { token }
    );
  }
}

