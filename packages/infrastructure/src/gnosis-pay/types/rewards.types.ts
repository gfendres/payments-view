/**
 * Gnosis Pay API Rewards Response Types
 */

/**
 * Rewards info from API
 */
export interface ApiRewardsResponse {
  gnoBalance: string;
  isOgHolder: boolean;
  cashbackRate: number;
  totalEarned: {
    value: string;
    currency: string;
    decimals: number;
  };
  earnedThisMonth: {
    value: string;
    currency: string;
    decimals: number;
  };
  eligibleTransactionCount: number;
}

