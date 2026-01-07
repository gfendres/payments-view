import { API_CONFIG } from '@payments-view/constants';

import type { ILogger } from '@payments-view/domain';

import { HttpClient } from '../http/client';
import type { ApiResult, HttpMethod } from '../http/types';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

/**
 * CoinGecko API client backed by the shared HttpClient.
 */
export class CoinGeckoClient {
  private readonly httpClient: HttpClient;
  private readonly apiKey: string | undefined;

  constructor(baseUrl?: string, apiKey?: string, logger?: ILogger) {
    this.httpClient = new HttpClient({
      baseUrl: baseUrl ?? API_CONFIG.COINGECKO.BASE_URL,
      serviceName: 'CoinGeckoClient',
      correlationPrefix: 'cg',
      sensitiveParams: ['apiKey', 'key', 'secret'],
      ...(logger ? { logger } : {}),
    });
    this.apiKey = apiKey;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const { method = 'GET', body, timeout, retries } = options;

    const requestOptions: {
      method: HttpMethod;
      body?: unknown;
      timeout?: number;
      retries?: number;
      headers: Record<string, string>;
    } = {
      method,
      body,
      headers: this.buildHeaders(),
    };

    if (timeout !== undefined) {
      requestOptions.timeout = timeout;
    }

    if (retries !== undefined) {
      requestOptions.retries = retries;
    }

    return await this.httpClient.request<T>(endpoint, requestOptions);
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Add API key if provided (for Pro API with higher rate limits)
    if (this.apiKey) {
      headers['x-cg-pro-api-key'] = this.apiKey;
    }

    return headers;
  }
}
