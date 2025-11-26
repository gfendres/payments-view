/**
 * Gnosis Pay API Rewards Response Types
 *
 * Based on official docs: https://docs.gnosispay.com/api-reference/rewards/retrieve-rewards-information
 * Last verified: 2024-11-26
 */

/**
 * Rewards info from API
 *
 * Note: The API returns a very simple structure with just 3 fields:
 * - isOg (not isOgHolder!)
 * - gnoBalance (number, not string!)
 * - cashbackRate
 */
export interface ApiRewardsResponse {
  isOg: boolean;
  gnoBalance: number;
  cashbackRate: number;
}
