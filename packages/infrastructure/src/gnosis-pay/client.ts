import {
  API_CONFIG,
  REQUEST_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
} from '@payments-view/constants';

import type { ApiErrorResponse, ApiResult } from './types';

/**
 * HTTP method types
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Request options
 */
interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is retriable
 */
const isRetriableStatus = (status: number): boolean => {
  return status >= 500;
};

/**
 * Create timeout error result
 */
const createTimeoutError = (): ApiResult<never> => ({
  success: false,
  error: { error: 'TIMEOUT', message: 'Request timed out' },
});

/**
 * Create network error result
 */
const createNetworkError = (error: unknown): ApiResult<never> => ({
  success: false,
  error: {
    error: 'NETWORK_ERROR',
    message: error instanceof Error ? error.message : 'Network error',
  },
});

/**
 * Create max retries error result
 */
const createMaxRetriesError = (): ApiResult<never> => ({
  success: false,
  error: { error: 'MAX_RETRIES', message: 'Max retries exceeded' },
});

/**
 * Parse JSON error response safely
 */
interface ErrorResponseData {
  error?: string;
  message?: string;
}

const parseJsonError = async (response: Response): Promise<ApiErrorResponse> => {
  try {
    const data: unknown = await response.json();
    const errorData = data as ErrorResponseData;
    return {
      error: errorData.error ?? 'API_ERROR',
      message: errorData.message ?? response.statusText,
      statusCode: response.status,
    };
  } catch {
    return {
      error: 'API_ERROR',
      message: response.statusText,
      statusCode: response.status,
    };
  }
};

/**
 * Base HTTP client for Gnosis Pay API
 */
export class GnosisPayClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? API_CONFIG.GNOSIS_PAY.BASE_URL;
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const {
      method = 'GET',
      body,
      token,
      timeout = REQUEST_TIMEOUT_MS,
      retries = MAX_RETRY_ATTEMPTS,
    } = options;

    const headers = this.buildHeaders(token);
    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const result = await this.executeRequest<T>(url, method, headers, body, timeout);

      if (result.shouldRetry && attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      return result.response;
    }

    return createMaxRetriesError();
  }

  /**
   * Build request headers
   */
  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Execute a single request attempt
   */
  private async executeRequest<T>(
    url: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown,
    timeout: number
  ): Promise<{ response: ApiResult<T>; shouldRetry: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  /**
   * Handle successful fetch response
   */
  private async handleResponse<T>(
    response: Response
  ): Promise<{ response: ApiResult<T>; shouldRetry: boolean }> {
    if (!response.ok) {
      const errorData = await parseJsonError(response);
      const shouldRetry = isRetriableStatus(response.status);
      return { response: { success: false, error: errorData }, shouldRetry };
    }

    const data = (await response.json()) as T;
    return { response: { success: true, data }, shouldRetry: false };
  }

  /**
   * Handle fetch error
   */
  private handleError<T>(error: unknown): Promise<{ response: ApiResult<T>; shouldRetry: boolean }> {
    if (error instanceof Error && error.name === 'AbortError') {
      return Promise.resolve({ response: createTimeoutError(), shouldRetry: true });
    }

    return Promise.resolve({ response: createNetworkError(error), shouldRetry: true });
  }
}
