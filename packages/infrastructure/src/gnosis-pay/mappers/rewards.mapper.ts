import { CurrencyCode } from '@payments-view/constants';
import { RewardsInfo, Money } from '@payments-view/domain';

import type { ApiRewardsResponse } from '../types';

/**
 * Map API rewards response to domain RewardsInfo entity
 *
 * Note: The Gnosis Pay API only returns 3 fields:
 * - isOg: boolean (OG NFT holder status)
 * - gnoBalance: number (GNO token balance)
 * - cashbackRate: number (BASE cashback rate %, add 1% for OG holders)
 *
 * Our domain entity expects additional fields that don't exist in the API,
 * so we provide default values for those.
 */
export function mapRewardsInfo(apiRewards: ApiRewardsResponse): RewardsInfo {
  // Use API-provided cashbackRate instead of calculating from tier
  // API provides BASE rate; OG bonus (+1%) is added in domain entity
  return RewardsInfo.create({
    gnoBalance: apiRewards.gnoBalance,
    isOgHolder: apiRewards.isOg, // Note: API uses "isOg", not "isOgHolder"
    apiCashbackRate: apiRewards.cashbackRate, // BASE rate from API
    totalEarned: Money.zero(CurrencyCode.EUR),
    earnedThisMonth: Money.zero(CurrencyCode.EUR),
    eligibleTransactionCount: 0,
  });
}
