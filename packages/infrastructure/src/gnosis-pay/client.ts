import { API_CONFIG } from '@payments-view/constants';

import type { ILogger } from '@payments-view/domain';

import { HttpClient } from '../http/client';
import type { ApiResult, HttpMethod } from '../http/types';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Base HTTP client for Gnosis Pay API backed by the shared HttpClient.
 */
export class GnosisPayClient {
  private readonly httpClient: HttpClient;

  constructor(baseUrl?: string, logger?: ILogger) {
    this.httpClient = new HttpClient({
      baseUrl: baseUrl ?? API_CONFIG.GNOSIS_PAY.BASE_URL,
      serviceName: 'GnosisPayClient',
      correlationPrefix: 'gp',
      sensitiveParams: ['token', 'apiKey', 'key', 'secret'],
      ...(logger ? { logger } : {}),
    });
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const { method = 'GET', body, token, timeout, retries } = options;

    const requestOptions: {
      method: HttpMethod;
      body?: unknown;
      timeout?: number;
      retries?: number;
      headers: Record<string, string>;
      logContext: { hasToken: boolean };
    } = {
      method,
      body,
      headers: this.buildHeaders(token),
      logContext: { hasToken: Boolean(token) },
    };

    if (timeout !== undefined) {
      requestOptions.timeout = timeout;
    }

    if (retries !== undefined) {
      requestOptions.retries = retries;
    }

    return this.httpClient.request<T>(endpoint, requestOptions);
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}
