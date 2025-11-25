import { type CurrencyCode, CurrencyCode as CurrencyCodeEnum } from '@payments-view/constants';
import { RewardsInfo, Money } from '@payments-view/domain';

import type { ApiRewardsResponse } from '../types';

/**
 * Map API rewards response to domain RewardsInfo entity
 */
export function mapRewardsInfo(apiRewards: ApiRewardsResponse): RewardsInfo {
  const totalCurrency = apiRewards.totalEarned.currency || CurrencyCodeEnum.EUR;
  const totalEarned = Money.create(
    apiRewards.totalEarned.value,
    totalCurrency as CurrencyCode,
    apiRewards.totalEarned.decimals
  );

  const monthCurrency = apiRewards.earnedThisMonth.currency || CurrencyCodeEnum.EUR;
  const earnedThisMonth = Money.create(
    apiRewards.earnedThisMonth.value,
    monthCurrency as CurrencyCode,
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

