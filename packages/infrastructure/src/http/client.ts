import {
  MAX_RETRY_ATTEMPTS,
  REQUEST_TIMEOUT_MS,
  RETRY_DELAY_MS,
} from '@payments-view/constants';

import type { ILogger } from '@payments-view/domain';

import { createLogger } from '../logging';
import type {
  ApiErrorResponse,
  ApiResult,
  HttpMethod,
  HttpRequestOptions,
} from './types';

export interface HttpClientOptions {
  baseUrl: string;
  serviceName: string;
  correlationPrefix: string;
  logger?: ILogger;
  defaultHeaders?: Record<string, string>;
  sensitiveParams?: string[];
}

const sleep = async (ms: number): Promise<void> =>
  { await new Promise((resolve) => setTimeout(resolve, ms)); };

const isRetriableStatus = (status: number): boolean => status >= 500;

const createTimeoutError = (): ApiResult<never> => ({
  success: false,
  error: { error: 'TIMEOUT', message: 'Request timed out' },
});

const createNetworkError = (error: unknown): ApiResult<never> => ({
  success: false,
  error: {
    error: 'NETWORK_ERROR',
    message: error instanceof Error ? error.message : 'Network error',
  },
});

const createMaxRetriesError = (): ApiResult<never> => ({
  success: false,
  error: { error: 'MAX_RETRIES', message: 'Max retries exceeded' },
});

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

export class HttpClient {
  private readonly baseUrl: string;
  private readonly logger: ILogger;
  private readonly defaultHeaders: Record<string, string>;
  private readonly correlationPrefix: string;
  private readonly sensitiveParams: string[];

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.logger = options.logger ?? createLogger({ service: options.serviceName });
    this.defaultHeaders = options.defaultHeaders ?? {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    this.correlationPrefix = options.correlationPrefix;
    this.sensitiveParams = options.sensitiveParams ?? ['token', 'apiKey', 'key', 'secret'];
  }

  async request<T>(endpoint: string, options: HttpRequestOptions = {}): Promise<ApiResult<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = REQUEST_TIMEOUT_MS,
      retries = MAX_RETRY_ATTEMPTS,
      logContext = {},
    } = options;

    const ctx = {
      correlationId: this.generateCorrelationId(),
      headers: { ...this.defaultHeaders, ...headers },
      url: `${this.baseUrl}${endpoint}`,
      startTime: Date.now(),
      logContext,
    };

    this.logRequestStart(ctx.correlationId, method, ctx.url, Boolean(body), ctx.logContext);

    return await this.executeWithRetry<T>(ctx, method, body, timeout, retries);
  }

  private async executeWithRetry<T>(
    ctx: {
      correlationId: string;
      headers: Record<string, string>;
      url: string;
      startTime: number;
      logContext: Record<string, unknown>;
    },
    method: HttpMethod,
    body: unknown,
    timeout: number,
    retries: number
  ): Promise<ApiResult<T>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        this.logger.debug('Retrying request', {
          correlationId: ctx.correlationId,
          attempt,
          maxRetries: retries,
        });
      }

      const result = await this.executeRequest<T>(ctx.url, method, ctx.headers, body, timeout);

      if (result.shouldRetry && attempt < retries) {
        await this.handleRetry(ctx.correlationId, attempt, result.response);
        continue;
      }

      this.logResponse(
        ctx.correlationId,
        method,
        ctx.url,
        result.response,
        Date.now() - ctx.startTime,
        ctx.logContext
      );

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

  private async handleError<T>(error: unknown): Promise<{ response: ApiResult<T>; shouldRetry: boolean }> {
    if (error instanceof Error && error.name === 'AbortError') {
      return await Promise.resolve({ response: createTimeoutError(), shouldRetry: true });
    }

    return await Promise.resolve({ response: createNetworkError(error), shouldRetry: true });
  }

  private logRequestStart(
    correlationId: string,
    method: string,
    url: string,
    hasBody: boolean,
    context: Record<string, unknown>
  ): void {
    this.logger.info('API request started', {
      correlationId,
      method,
      url: this.sanitizeUrl(url),
      hasBody,
      ...context,
    });
  }

  private logResponse<T>(
    correlationId: string,
    method: string,
    url: string,
    result: ApiResult<T>,
    durationMs: number,
    context: Record<string, unknown>
  ): void {
    const baseContext = {
      correlationId,
      method,
      url: this.sanitizeUrl(url),
      durationMs,
      ...context,
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

  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);

      for (const param of this.sensitiveParams) {
        if (parsed.searchParams.has(param)) {
          parsed.searchParams.set(param, '[REDACTED]');
        }
      }

      return parsed.toString();
    } catch {
      return url;
    }
  }

  private generateCorrelationId(): string {
    return `${this.correlationPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
