import type { Result } from '@payments-view/domain/shared';
import type { DomainError } from '@payments-view/domain/shared';
import type { CurrencyCode } from '@payments-view/constants';
import type { ITokenPriceRepository, TokenPrice } from '@payments-view/domain/pricing';

/**
 * Get token price use case input
 */
export interface GetTokenPriceInput {
  tokenId: string;
  currency: CurrencyCode;
}

/**
 * Get token price use case output
 */
export type GetTokenPriceOutput = TokenPrice;

/**
 * Get Token Price Use Case
 * Retrieves token price from external pricing service
 */
export class GetTokenPriceUseCase {
  constructor(private readonly tokenPriceRepository: ITokenPriceRepository) {}

  /**
   * Execute the use case
   */
  async execute(
    input: GetTokenPriceInput
  ): Promise<Result<GetTokenPriceOutput, DomainError>> {
    return this.tokenPriceRepository.getTokenPrice(input.tokenId, input.currency);
  }
}


