/**
 * Common HTTP and API response types shared across clients.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorResponse };

export interface HttpRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  /**
   * Additional context that should be logged alongside the request lifecycle.
   */
  logContext?: Record<string, unknown>;
}
