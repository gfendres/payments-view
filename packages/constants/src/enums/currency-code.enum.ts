/**
 * Supported currency codes
 */
export enum CurrencyCode {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
  SEK = 'SEK',
  NOK = 'NOK',
  DKK = 'DKK',
  PLN = 'PLN',
  CZK = 'CZK',
  HUF = 'HUF',
}

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Currency configuration lookup
 */
export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  [CurrencyCode.EUR]: { code: CurrencyCode.EUR, symbol: '€', name: 'Euro', decimals: 2 },
  [CurrencyCode.USD]: { code: CurrencyCode.USD, symbol: '$', name: 'US Dollar', decimals: 2 },
  [CurrencyCode.GBP]: { code: CurrencyCode.GBP, symbol: '£', name: 'British Pound', decimals: 2 },
  [CurrencyCode.CHF]: { code: CurrencyCode.CHF, symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  [CurrencyCode.SEK]: { code: CurrencyCode.SEK, symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  [CurrencyCode.NOK]: { code: CurrencyCode.NOK, symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  [CurrencyCode.DKK]: { code: CurrencyCode.DKK, symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  [CurrencyCode.PLN]: { code: CurrencyCode.PLN, symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
  [CurrencyCode.CZK]: { code: CurrencyCode.CZK, symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  [CurrencyCode.HUF]: { code: CurrencyCode.HUF, symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
};

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCY_CONFIG[code].symbol;
}

