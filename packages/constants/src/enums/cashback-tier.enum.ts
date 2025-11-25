/**
 * Cashback tier enum representing the different cashback tiers
 */
export enum CashbackTier {
  TIER_0 = 0,
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
  TIER_4 = 4,
}

/**
 * Configuration for each cashback tier
 */
export interface CashbackTierConfig {
  tier: CashbackTier;
  minGno: number;
  maxGno: number | null;
  baseRate: number;
  label: string;
}

/**
 * Cashback tier configuration lookup
 */
export const CASHBACK_TIER_CONFIG: Record<CashbackTier, CashbackTierConfig> = {
  [CashbackTier.TIER_0]: {
    tier: CashbackTier.TIER_0,
    minGno: 0,
    maxGno: 1,
    baseRate: 0,
    label: 'No Cashback',
  },
  [CashbackTier.TIER_1]: {
    tier: CashbackTier.TIER_1,
    minGno: 1,
    maxGno: 10,
    baseRate: 1,
    label: 'Bronze',
  },
  [CashbackTier.TIER_2]: {
    tier: CashbackTier.TIER_2,
    minGno: 10,
    maxGno: 50,
    baseRate: 2,
    label: 'Silver',
  },
  [CashbackTier.TIER_3]: {
    tier: CashbackTier.TIER_3,
    minGno: 50,
    maxGno: 100,
    baseRate: 3,
    label: 'Gold',
  },
  [CashbackTier.TIER_4]: {
    tier: CashbackTier.TIER_4,
    minGno: 100,
    maxGno: null,
    baseRate: 4,
    label: 'Platinum',
  },
};

/**
 * OG NFT holder bonus rate (added to base rate)
 */
export const OG_BONUS_RATE = 1;

/**
 * Get the cashback tier for a given GNO balance
 */
export function getCashbackTier(gnoBalance: number): CashbackTier {
  if (gnoBalance >= 100) return CashbackTier.TIER_4;
  if (gnoBalance >= 50) return CashbackTier.TIER_3;
  if (gnoBalance >= 10) return CashbackTier.TIER_2;
  if (gnoBalance >= 1) return CashbackTier.TIER_1;
  return CashbackTier.TIER_0;
}

/**
 * Calculate total cashback rate including OG bonus
 */
export function getTotalCashbackRate(tier: CashbackTier, isOgHolder: boolean): number {
  const baseRate = CASHBACK_TIER_CONFIG[tier].baseRate;
  return isOgHolder ? baseRate + OG_BONUS_RATE : baseRate;
}

