import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError } from '@payments-view/domain/shared';
import type { IRewardsRepository } from '@payments-view/domain/rewards';
import type { RewardsInfo } from '@payments-view/domain/rewards';

import { GnosisPayRewardsClient } from './rewards-client';
import { mapRewardsInfo } from './mappers';

/**
 * Gnosis Pay rewards repository implementation
 */
export class GnosisPayRewardsRepository implements IRewardsRepository {
  private readonly client: GnosisPayRewardsClient;

  constructor(client?: GnosisPayRewardsClient) {
    this.client = client ?? new GnosisPayRewardsClient();
  }

  /**
   * Get user's rewards information
   */
  async getRewardsInfo(token: string): Promise<Result<RewardsInfo, ExternalServiceError>> {
    const result = await this.client.getRewards(token);

    if (!result.success) {
      return Result.err(
        new ExternalServiceError(
          'GnosisPay',
          result.error.message ?? 'Failed to fetch rewards info'
        )
      );
    }

    return Result.ok(mapRewardsInfo(result.data));
  }
}

