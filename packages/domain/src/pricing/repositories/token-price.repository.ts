import type { Result } from '../../shared/result';
import type { DomainError } from '../../shared/errors';
import type { CurrencyCode } from '@payments-view/constants';
import type { TokenPrice } from '../value-objects/token-price';

/**
 * Token price repository interface
 */
export interface ITokenPriceRepository {
  /**
   * Get token price in specified currency
   */
  getTokenPrice(
    tokenId: string,
    currency: CurrencyCode
  ): Promise<Result<TokenPrice, DomainError>>;
}


