import type { CurrencyCode } from '@payments-view/constants';

/**
 * TokenPrice value object - represents a token's price in a specific currency
 */
export class TokenPrice {
  private constructor(
    private readonly _tokenId: string,
    private readonly _price: number,
    private readonly _currency: CurrencyCode,
    private readonly _lastUpdatedAt: Date,
    private readonly _change24h?: number | null,
    private readonly _marketCap?: number | null
  ) {}

  /**
   * Create a TokenPrice instance
   */
  static create(params: {
    tokenId: string;
    price: number;
    currency: CurrencyCode;
    lastUpdatedAt: Date;
    change24h?: number | null;
    marketCap?: number | null;
  }): TokenPrice {
    return new TokenPrice(
      params.tokenId,
      params.price,
      params.currency,
      params.lastUpdatedAt,
      params.change24h,
      params.marketCap
    );
  }

  /**
   * Get the token ID (e.g., "gnosis")
   */
  get tokenId(): string {
    return this._tokenId;
  }

  /**
   * Get the price
   */
  get price(): number {
    return this._price;
  }

  /**
   * Get the currency code
   */
  get currency(): CurrencyCode {
    return this._currency;
  }

  /**
   * Get the last updated timestamp
   */
  get lastUpdatedAt(): Date {
    return this._lastUpdatedAt;
  }

  /**
   * Get the 24h price change percentage (can be negative)
   */
  get change24h(): number | null {
    return this._change24h ?? null;
  }

  /**
   * Get the market cap (if available)
   */
  get marketCap(): number | null {
    return this._marketCap ?? null;
  }

  /**
   * Check if price is stale (older than specified milliseconds)
   */
  isStale(maxAgeMs: number): boolean {
    const age = Date.now() - this._lastUpdatedAt.getTime();
    return age > maxAgeMs;
  }

  /**
   * Format price for display
   */
  formatPrice(options?: Intl.NumberFormatOptions): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
      ...options,
    });
    return formatter.format(this._price);
  }

  /**
   * Format 24h change for display
   */
  formatChange24h(): string {
    if (this._change24h === null || this._change24h === undefined) {
      return 'N/A';
    }
    const sign = this._change24h >= 0 ? '+' : '';
    return `${sign}${this._change24h.toFixed(2)}%`;
  }

  /**
   * Check equality
   */
  equals(other: TokenPrice): boolean {
    return (
      this._tokenId === other._tokenId &&
      this._currency === other._currency &&
      this._price === other._price
    );
  }
}






