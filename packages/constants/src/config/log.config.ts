import { LogLevel } from '../enums/log-level.enum';

/**
 * Logging configuration
 */
export const LOG_CONFIG = {
  /**
   * Default log level based on environment
   */
  DEFAULT_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,

  /**
   * Include stack traces in non-production environments
   */
  INCLUDE_STACK_TRACE: process.env.NODE_ENV !== 'production',

  /**
   * Fields to redact from logs
   */
  SENSITIVE_FIELDS: ['password', 'token', 'apiKey', 'secret', 'jwt', 'authorization'],

  /**
   * Maximum log message length
   */
  MAX_MESSAGE_LENGTH: 10000,
} as const;

