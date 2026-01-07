import {
  CASHBACK_TIER_CONFIG,
  type CashbackTier as CashbackTierEnum,
  FORMAT_CONFIG,
  getCashbackTier,
  getTotalCashbackRate,
  OG_BONUS_RATE,
} from '@payments-view/constants';

/**
 * CashbackTier value object - represents cashback tier information
 */
export class CashbackTierInfo {
  private constructor(
    private readonly _tier: CashbackTierEnum,
    private readonly _gnoBalance: number,
    private readonly _isOgHolder: boolean
  ) {}

  /**
   * Create a CashbackTierInfo from GNO balance
   */
  static fromBalance(gnoBalance: number, isOgHolder: boolean): CashbackTierInfo {
    const tier = getCashbackTier(gnoBalance);
    return new CashbackTierInfo(tier, gnoBalance, isOgHolder);
  }

  get tier(): CashbackTierEnum {
    return this._tier;
  }

  get gnoBalance(): number {
    return this._gnoBalance;
  }

  get isOgHolder(): boolean {
    return this._isOgHolder;
  }

  /**
   * Get the base cashback rate (without OG bonus)
   */
  get baseRate(): number {
    return CASHBACK_TIER_CONFIG[this._tier].baseRate;
  }

  /**
   * Get the total cashback rate (including OG bonus if applicable)
   */
  get totalRate(): number {
    return getTotalCashbackRate(this._tier, this._isOgHolder);
  }

  /**
   * Get the tier label
   */
  get label(): string {
    return CASHBACK_TIER_CONFIG[this._tier].label;
  }

  /**
   * Get the minimum GNO for current tier
   */
  get minGnoForCurrentTier(): number {
    return CASHBACK_TIER_CONFIG[this._tier].minGno;
  }

  /**
   * Get the maximum GNO for current tier (null for top tier)
   */
  get maxGnoForCurrentTier(): number | null {
    return CASHBACK_TIER_CONFIG[this._tier].maxGno;
  }

  /**
   * Check if at max tier
   */
  get isMaxTier(): boolean {
    return this.maxGnoForCurrentTier === null;
  }

  /**
   * Get GNO needed for next tier (0 if at max)
   */
  get gnoNeededForNextTier(): number {
    if (this.isMaxTier) return 0;

    const maxGno = this.maxGnoForCurrentTier;
    return maxGno !== null ? maxGno - this._gnoBalance : 0;
  }

  /**
   * Get progress percentage to next tier
   */
  get progressToNextTier(): number {
    if (this.isMaxTier) return FORMAT_CONFIG.PERCENTAGE.FULL;

    const min = this.minGnoForCurrentTier;
    const max = this.maxGnoForCurrentTier;
    if (max === null) return FORMAT_CONFIG.PERCENTAGE.FULL;

    const range = max - min;
    return range > 0 ? ((this._gnoBalance - min) / range) * FORMAT_CONFIG.PERCENTAGE.FULL : FORMAT_CONFIG.PERCENTAGE.FULL;
  }

  /**
   * Get the next tier's rate (returns current rate if at max)
   */
  get nextTierRate(): number {
    if (this.isMaxTier) return this.totalRate;

    const nextTier = (this._tier + 1) as CashbackTierEnum;
    return getTotalCashbackRate(nextTier, this._isOgHolder);
  }

  /**
   * Get the OG bonus rate (0 if not OG holder)
   */
  get ogBonusRate(): number {
    return this._isOgHolder ? OG_BONUS_RATE : 0;
  }
}
