import { describe, test, expect, mock } from 'bun:test';
import { GetTokenPriceUseCase } from '../pricing/get-token-price.use-case';
import { Result } from '@payments-view/domain/shared';
import { ExternalServiceError } from '@payments-view/domain/shared';
import { TokenPrice } from '@payments-view/domain/pricing';
import type { ITokenPriceRepository } from '@payments-view/domain/pricing';
import { CurrencyCode } from '@payments-view/constants';

describe('GetTokenPriceUseCase', () => {
  test('should call repository with correct parameters', async () => {
    const mockRepository: ITokenPriceRepository = {
      getTokenPrice: mock(() =>
        Promise.resolve(
          Result.ok(
            TokenPrice.create({
              tokenId: 'gnosis',
              price: 100.50,
              currency: CurrencyCode.USD,
              lastUpdatedAt: new Date(),
            })
          )
        )
      ),
    };

    const useCase = new GetTokenPriceUseCase(mockRepository);
    const input = { tokenId: 'gnosis', currency: CurrencyCode.USD };

    await useCase.execute(input);

    expect(mockRepository.getTokenPrice).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTokenPrice).toHaveBeenCalledWith('gnosis', CurrencyCode.USD);
  });

  test('should return repository result', async () => {
    const expectedPrice = TokenPrice.create({
      tokenId: 'gnosis',
      price: 100.50,
      currency: CurrencyCode.USD,
      lastUpdatedAt: new Date(),
    });

    const mockRepository: ITokenPriceRepository = {
      getTokenPrice: mock(() => Promise.resolve(Result.ok(expectedPrice))),
    };

    const useCase = new GetTokenPriceUseCase(mockRepository);
    const result = await useCase.execute({ tokenId: 'gnosis', currency: CurrencyCode.USD });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value).toBe(expectedPrice);
    }
  });

  test('should propagate errors from repository', async () => {
    const error = new ExternalServiceError('pricing', 'Repository error');
    const mockRepository: ITokenPriceRepository = {
      getTokenPrice: mock(() => Promise.resolve(Result.err(error))),
    };

    const useCase = new GetTokenPriceUseCase(mockRepository);
    const result = await useCase.execute({ tokenId: 'gnosis', currency: CurrencyCode.USD });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBe(error);
    }
  });
});

