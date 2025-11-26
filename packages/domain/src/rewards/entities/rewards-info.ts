import { CashbackTierInfo } from '../value-objects/cashback-tier';
import { Money } from '../../transaction/value-objects/money';
import { CurrencyCode, OG_BONUS_RATE } from '@payments-view/constants';

/**
 * RewardsInfo entity props
 */
export interface RewardsInfoProps {
  gnoBalance: number;
  isOgHolder: boolean;
  /** Base cashback rate from API (without OG bonus) */
  apiCashbackRate?: number;
  totalEarned: Money;
  earnedThisMonth: Money;
  eligibleTransactionCount: number;
}

/**
 * RewardsInfo entity - represents user's cashback rewards information
 */
export class RewardsInfo {
  private readonly _tierInfo: CashbackTierInfo;
  private readonly _apiCashbackRate: number | undefined;
  private readonly _isOgHolder: boolean;
  private readonly _totalEarned: Money;
  private readonly _earnedThisMonth: Money;
  private readonly _eligibleTransactionCount: number;

  private constructor(props: RewardsInfoProps) {
    this._tierInfo = CashbackTierInfo.fromBalance(props.gnoBalance, props.isOgHolder);
    this._apiCashbackRate = props.apiCashbackRate;
    this._isOgHolder = props.isOgHolder;
    this._totalEarned = props.totalEarned;
    this._earnedThisMonth = props.earnedThisMonth;
    this._eligibleTransactionCount = props.eligibleTransactionCount;
  }

  /**
   * Create a RewardsInfo entity
   */
  static create(props: RewardsInfoProps): RewardsInfo {
    return new RewardsInfo(props);
  }

  /**
   * Create empty rewards info
   */
  static empty(): RewardsInfo {
    return new RewardsInfo({
      gnoBalance: 0,
      isOgHolder: false,
      totalEarned: Money.zero(CurrencyCode.EUR),
      earnedThisMonth: Money.zero(CurrencyCode.EUR),
      eligibleTransactionCount: 0,
    });
  }

  get tierInfo(): CashbackTierInfo {
    return this._tierInfo;
  }

  get gnoBalance(): number {
    return this._tierInfo.gnoBalance;
  }

  get isOgHolder(): boolean {
    return this._isOgHolder;
  }

  /**
   * Get the total cashback rate (including OG bonus if applicable)
   * Uses API-provided rate if available, otherwise falls back to tier calculation
   */
  get currentRate(): number {
    if (this._apiCashbackRate !== undefined) {
      // API provides BASE rate, add OG bonus if applicable
      return this._apiCashbackRate + (this._isOgHolder ? OG_BONUS_RATE : 0);
    }
    return this._tierInfo.totalRate;
  }

  /**
   * Get the base cashback rate (without OG bonus)
   * Uses API-provided rate if available
   */
  get baseRate(): number {
    if (this._apiCashbackRate !== undefined) {
      return this._apiCashbackRate;
    }
    return this._tierInfo.baseRate;
  }

  get tierLabel(): string {
    return this._tierInfo.label;
  }

  get totalEarned(): Money {
    return this._totalEarned;
  }

  get earnedThisMonth(): Money {
    return this._earnedThisMonth;
  }

  get eligibleTransactionCount(): number {
    return this._eligibleTransactionCount;
  }

  /**
   * Calculate cashback for a given amount
   */
  calculateCashback(amount: Money): Money {
    const rate = this.currentRate / 100;
    return amount.multiply(rate);
  }
}

