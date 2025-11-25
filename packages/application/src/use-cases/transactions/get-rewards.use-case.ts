import type { Result } from '@payments-view/domain/shared';
import type { DomainError } from '@payments-view/domain/shared';
import type { IRewardsRepository, RewardsInfo } from '@payments-view/domain/rewards';

/**
 * Get rewards use case input
 */
export interface GetRewardsInput {
  token: string;
}

/**
 * Get rewards use case output
 */
export type GetRewardsOutput = RewardsInfo;

/**
 * Get Rewards Use Case
 * Retrieves rewards information for the authenticated user
 */
export class GetRewardsUseCase {
  constructor(private readonly rewardsRepository: IRewardsRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: GetRewardsInput): Promise<Result<GetRewardsOutput, DomainError>> {
    return this.rewardsRepository.getRewardsInfo(input.token);
  }
}

