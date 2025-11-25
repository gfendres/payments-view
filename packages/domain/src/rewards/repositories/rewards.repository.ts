import type { Result } from '../../shared/result';
import type { DomainError } from '../../shared/errors';
import type { RewardsInfo } from '../entities/rewards-info';

/**
 * Rewards repository interface
 */
export interface IRewardsRepository {
  /**
   * Get user's rewards information
   */
  getRewardsInfo(token: string): Promise<Result<RewardsInfo, DomainError>>;
}

