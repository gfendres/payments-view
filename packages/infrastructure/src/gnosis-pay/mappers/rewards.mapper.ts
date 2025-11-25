import { type CurrencyCode, CurrencyCode as CurrencyCodeEnum } from '@payments-view/constants';
import { RewardsInfo, Money } from '@payments-view/domain';

import type { ApiRewardsResponse } from '../types';

/**
 * Map API rewards response to domain RewardsInfo entity
 */
export function mapRewardsInfo(apiRewards: ApiRewardsResponse): RewardsInfo {
  const totalEarned = Money.create(
    apiRewards.totalEarned.value,
    (apiRewards.totalEarned.currency as CurrencyCode) ?? CurrencyCodeEnum.EUR,
    apiRewards.totalEarned.decimals
  );

  const earnedThisMonth = Money.create(
    apiRewards.earnedThisMonth.value,
    (apiRewards.earnedThisMonth.currency as CurrencyCode) ?? CurrencyCodeEnum.EUR,
    apiRewards.earnedThisMonth.decimals
  );

  return RewardsInfo.create({
    gnoBalance: parseFloat(apiRewards.gnoBalance),
    isOgHolder: apiRewards.isOgHolder,
    totalEarned,
    earnedThisMonth,
    eligibleTransactionCount: apiRewards.eligibleTransactionCount,
  });
}

