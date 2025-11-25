import type { LogLevel } from '@payments-view/constants';

/**
 * Log context - additional metadata for log entries
 */
export interface LogContext {
  /**
   * Correlation ID for request tracing
   */
  correlationId?: string;

  /**
   * HTTP method (GET, POST, etc.)
   */
  method?: string;

  /**
   * Request URL
   */
  url?: string;

  /**
   * HTTP status code
   */
  statusCode?: number;

  /**
   * Request duration in milliseconds
   */
  durationMs?: number;

  /**
   * Additional context data
   */
  [key: string]: unknown;
}

/**
 * Logger interface for dependency injection
 *
 * This interface should be implemented by concrete loggers
 * in the infrastructure layer.
 */
export interface ILogger {
  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void;

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error, context?: LogContext): void;

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): ILogger;

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void;
}

