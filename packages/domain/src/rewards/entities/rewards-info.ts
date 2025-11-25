import { CashbackTierInfo } from '../value-objects/cashback-tier';
import { Money } from '../../transaction/value-objects/money';
import { CurrencyCode } from '@payments-view/constants';

/**
 * RewardsInfo entity props
 */
export interface RewardsInfoProps {
  gnoBalance: number;
  isOgHolder: boolean;
  totalEarned: Money;
  earnedThisMonth: Money;
  eligibleTransactionCount: number;
}

/**
 * RewardsInfo entity - represents user's cashback rewards information
 */
export class RewardsInfo {
  private readonly _tierInfo: CashbackTierInfo;
  private readonly _totalEarned: Money;
  private readonly _earnedThisMonth: Money;
  private readonly _eligibleTransactionCount: number;

  private constructor(props: RewardsInfoProps) {
    this._tierInfo = CashbackTierInfo.fromBalance(props.gnoBalance, props.isOgHolder);
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
    return this._tierInfo.isOgHolder;
  }

  get currentRate(): number {
    return this._tierInfo.totalRate;
  }

  get baseRate(): number {
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

