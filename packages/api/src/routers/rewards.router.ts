import { GetRewardsUseCase } from '@payments-view/application/use-cases';
import type { RewardsInfo } from '@payments-view/domain/rewards';

import { handleDomainError, protectedProcedure, router } from '../trpc';

/**
 * Round rate to 2 decimal places
 */
function roundRate(rate: number): number {
  return Math.round(rate * 100) / 100;
}

/**
 * Serialize rewards info entity for API response
 */
function serializeRewardsInfo(rewards: RewardsInfo) {
  const tierInfo = rewards.tierInfo;

  return {
    gnoBalance: rewards.gnoBalance,
    isOgHolder: rewards.isOgHolder,
    tierLabel: rewards.tierLabel,
    currentRate: roundRate(rewards.currentRate),
    baseRate: roundRate(rewards.baseRate),
    totalEarned: {
      amount: rewards.totalEarned.toNumber(),
      currency: rewards.totalEarned.currency,
      formatted: rewards.totalEarned.format(),
    },
    earnedThisMonth: {
      amount: rewards.earnedThisMonth.toNumber(),
      currency: rewards.earnedThisMonth.currency,
      formatted: rewards.earnedThisMonth.format(),
    },
    eligibleTransactionCount: rewards.eligibleTransactionCount,
    tier: {
      current: tierInfo.tier,
      label: tierInfo.label,
      minGno: tierInfo.minGnoForCurrentTier,
      maxGno: tierInfo.maxGnoForCurrentTier,
      isMaxTier: tierInfo.isMaxTier,
      progressToNextTier: roundRate(tierInfo.progressToNextTier),
      gnoNeededForNextTier: roundRate(tierInfo.gnoNeededForNextTier),
      nextTierRate: roundRate(tierInfo.nextTierRate),
      ogBonusRate: tierInfo.ogBonusRate,
    },
  };
}

/**
 * Rewards tRPC router
 */
export const rewardsRouter = router({
  /**
   * Get user's rewards information
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const useCase = new GetRewardsUseCase(ctx.repositories.rewardsRepository);

    const result = await useCase.execute({
      token: ctx.session.token,
    });

    if (result.isFailure) {
      throw handleDomainError(result.error);
    }

    return serializeRewardsInfo(result.value);
  }),
});

export type RewardsRouter = typeof rewardsRouter;
