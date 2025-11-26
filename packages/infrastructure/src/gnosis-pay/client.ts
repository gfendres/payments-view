import {
  API_CONFIG,
  REQUEST_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
} from '@payments-view/constants';

import type { ILogger } from '@payments-view/domain';

import { createLogger } from '../logging';

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
 * Generate a correlation ID for request tracing
 */
const generateCorrelationId = (): string => {
  return `gp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Base HTTP client for Gnosis Pay API
 */
export class GnosisPayClient {
  private readonly baseUrl: string;
  private readonly logger: ILogger;

  constructor(baseUrl?: string, logger?: ILogger) {
    this.baseUrl = baseUrl ?? API_CONFIG.GNOSIS_PAY.BASE_URL;
    this.logger = logger ?? createLogger({ service: 'GnosisPayClient' });
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const { method = 'GET', body, token, timeout = REQUEST_TIMEOUT_MS, retries = MAX_RETRY_ATTEMPTS } = options;

    const ctx = {
      correlationId: generateCorrelationId(),
      headers: this.buildHeaders(token),
      url: `${this.baseUrl}${endpoint}`,
      startTime: Date.now(),
    };

    this.logRequestStart(ctx.correlationId, method, ctx.url, Boolean(body), Boolean(token));

    return this.executeWithRetry<T>(ctx, method, body, timeout, retries);
  }

  private logRequestStart(correlationId: string, method: string, url: string, hasBody: boolean, hasToken: boolean): void {
    this.logger.info('API request started', { correlationId, method, url: this.sanitizeUrl(url), hasBody, hasToken });
  }

  private async executeWithRetry<T>(
    ctx: { correlationId: string; headers: Record<string, string>; url: string; startTime: number },
    method: HttpMethod,
    body: unknown,
    timeout: number,
    retries: number
  ): Promise<ApiResult<T>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        this.logger.debug('Retrying request', { correlationId: ctx.correlationId, attempt, maxRetries: retries });
      }

      const result = await this.executeRequest<T>(ctx.url, method, ctx.headers, body, timeout);

      if (result.shouldRetry && attempt < retries) {
        await this.handleRetry(ctx.correlationId, attempt, result.response);
        continue;
      }

      this.logResponse(ctx.correlationId, method, ctx.url, result.response, Date.now() - ctx.startTime);
      return result.response;
    }

    return this.handleMaxRetriesExceeded(ctx, method, retries);
  }

  private async handleRetry<T>(correlationId: string, attempt: number, response: ApiResult<T>): Promise<void> {
    const delayMs = RETRY_DELAY_MS * (attempt + 1);
    this.logger.warn('Request failed, will retry', {
      correlationId,
      attempt,
      delayMs,
      error: response.success ? undefined : response.error.error,
    });
    await sleep(delayMs);
  }

  private handleMaxRetriesExceeded(
    ctx: { correlationId: string; url: string; startTime: number },
    method: string,
    retries: number
  ): ApiResult<never> {
    this.logger.error('Max retries exceeded', undefined, {
      correlationId: ctx.correlationId,
      method,
      url: this.sanitizeUrl(ctx.url),
      durationMs: Date.now() - ctx.startTime,
      attempts: retries + 1,
    });
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

    try {
      const data = (await response.json()) as T;

      return { response: { success: true, data }, shouldRetry: false };
    } catch (parseError) {
      // Response was successful but body is not valid JSON
      const message = parseError instanceof Error ? parseError.message : 'Invalid JSON response';
      return {
        response: {
          success: false,
          error: {
            error: 'INVALID_RESPONSE',
            message: `Failed to parse response: ${message}`,
            statusCode: response.status,
          },
        },
        shouldRetry: false,
      };
    }
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

  /**
   * Log API response
   */
  private logResponse<T>(
    correlationId: string,
    method: string,
    url: string,
    result: ApiResult<T>,
    durationMs: number
  ): void {
    const baseContext = {
      correlationId,
      method,
      url: this.sanitizeUrl(url),
      durationMs,
    };

    if (result.success) {
      this.logger.info('API request completed', {
        ...baseContext,
        statusCode: 200,
        success: true,
      });
    } else {
      const statusCode = result.error.statusCode ?? 0;
      const isClientError = statusCode >= 400 && statusCode < 500;

      if (isClientError) {
        this.logger.warn('API request failed (client error)', {
          ...baseContext,
          statusCode,
          errorCode: result.error.error,
          errorMessage: result.error.message,
        });
      } else {
        this.logger.error('API request failed', undefined, {
          ...baseContext,
          statusCode,
          errorCode: result.error.error,
          errorMessage: result.error.message,
        });
      }
    }
  }

  /**
   * Sanitize URL for logging (remove sensitive query params)
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const sensitiveParams = ['token', 'apiKey', 'key', 'secret'];

      for (const param of sensitiveParams) {
        if (parsed.searchParams.has(param)) {
          parsed.searchParams.set(param, '[REDACTED]');
        }
      }

      return parsed.toString();
    } catch {
      return url;
    }
  }
}
