import { type CurrencyCode, CURRENCY_CONFIG, getCurrencySymbol } from '@payments-view/constants';

/**
 * Money value object - immutable representation of a monetary value
 */
export class Money {
  private constructor(
    private readonly _amount: bigint,
    private readonly _currency: CurrencyCode,
    private readonly _decimals: number
  ) {}

  /**
   * Create a Money instance from a string amount (in smallest unit)
   */
  static create(amount: string, currency: CurrencyCode, decimals?: number): Money {
    const dec = decimals ?? CURRENCY_CONFIG[currency].decimals;
    return new Money(BigInt(amount), currency, dec);
  }

  /**
   * Create a Money instance from a number (in major unit, e.g., 25.50)
   */
  static fromNumber(amount: number, currency: CurrencyCode): Money {
    const decimals = CURRENCY_CONFIG[currency].decimals;
    const smallest = Math.round(amount * Math.pow(10, decimals));
    return new Money(BigInt(smallest), currency, decimals);
  }

  /**
   * Create zero money
   */
  static zero(currency: CurrencyCode): Money {
    return Money.create('0', currency);
  }

  /**
   * Get the amount in smallest unit (e.g., cents)
   */
  get amountSmallest(): bigint {
    return this._amount;
  }

  /**
   * Get the currency code
   */
  get currency(): CurrencyCode {
    return this._currency;
  }

  /**
   * Get the number of decimal places
   */
  get decimals(): number {
    return this._decimals;
  }

  /**
   * Convert to number (in major unit)
   */
  toNumber(): number {
    return Number(this._amount) / Math.pow(10, this._decimals);
  }

  /**
   * Format as currency string
   */
  format(locale = 'en-US'): string {
    const num = this.toNumber();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
      minimumFractionDigits: this._decimals,
      maximumFractionDigits: this._decimals,
    }).format(num);
  }

  /**
   * Format with symbol only (no locale formatting)
   */
  formatSimple(): string {
    const symbol = getCurrencySymbol(this._currency);
    const num = this.toNumber().toFixed(this._decimals);
    return `${symbol}${num}`;
  }

  /**
   * Add two money values (must be same currency)
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency, this._decimals);
  }

  /**
   * Subtract money value (must be same currency)
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount - other._amount, this._currency, this._decimals);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    const result = Number(this._amount) * factor;
    return new Money(BigInt(Math.round(result)), this._currency, this._decimals);
  }

  /**
   * Check if zero
   */
  isZero(): boolean {
    return this._amount === 0n;
  }

  /**
   * Check if positive
   */
  isPositive(): boolean {
    return this._amount > 0n;
  }

  /**
   * Check if negative
   */
  isNegative(): boolean {
    return this._amount < 0n;
  }

  /**
   * Get absolute value
   */
  abs(): Money {
    return this._amount < 0n
      ? new Money(-this._amount, this._currency, this._decimals)
      : this;
  }

  /**
   * Negate the value
   */
  negate(): Money {
    return new Money(-this._amount, this._currency, this._decimals);
  }

  /**
   * Check equality
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot operate on different currencies: ${this._currency} and ${other._currency}`);
    }
  }
}

