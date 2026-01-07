import {
  LOG_CONFIG,
  LOG_LEVEL_PRIORITY,
  LogLevel,
  shouldLog,
} from '@payments-view/constants';

import type { ILogger, LogContext } from '@payments-view/domain';

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Redact sensitive fields from context
 */
function redactSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = LOG_CONFIG.SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field.toLowerCase())
    );

    if (isSensitive) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveFields(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const sanitizedContext = entry.context ? redactSensitiveFields(entry.context) : undefined;

  const logObject = {
    ...entry,
    context: sanitizedContext,
  };

  return JSON.stringify(logObject);
}

/**
 * Truncate message if too long
 */
function truncateMessage(message: string): string {
  if (message.length > LOG_CONFIG.MAX_MESSAGE_LENGTH) {
    return `${message.slice(0, LOG_CONFIG.MAX_MESSAGE_LENGTH)}... [truncated]`;
  }
  return message;
}

/**
 * Logger implementation
 *
 * A structured logger that outputs JSON logs with context,
 * redacts sensitive fields, and supports log level filtering.
 */
export class Logger implements ILogger {
  private level: LogLevel;
  private baseContext: LogContext;

  constructor(level?: LogLevel, context?: LogContext) {
    this.level = level ?? LOG_CONFIG.DEFAULT_LEVEL;
    this.baseContext = context ?? {};
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  child(context: LogContext): ILogger {
    return new Logger(this.level, { ...this.baseContext, ...context });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!shouldLog(level, this.level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: truncateMessage(message),
      context: { ...this.baseContext, ...context },
    };

    if (error) {
      const errorInfo: LogEntry['error'] = {
        name: error.name,
        message: error.message,
      };

      if (LOG_CONFIG.INCLUDE_STACK_TRACE && error.stack) {
        errorInfo.stack = error.stack;
      }

      entry.error = errorInfo;
    }

    const formatted = formatLogEntry(entry);
    this.output(level, formatted);
  }

  /* eslint-disable no-console */
  private output(level: LogLevel, formatted: string): void {
    const priority = LOG_LEVEL_PRIORITY[level];

    if (priority >= LOG_LEVEL_PRIORITY[LogLevel.ERROR]) {
      console.error(formatted);
    } else if (priority >= LOG_LEVEL_PRIORITY[LogLevel.WARN]) {
      console.warn(formatted);
    } else if (priority >= LOG_LEVEL_PRIORITY[LogLevel.INFO]) {
      console.info(formatted);
    } else {
      console.debug(formatted);
    }
  }
  /* eslint-enable no-console */
}

/**
 * Create a new logger instance
 */
export function createLogger(context?: LogContext): ILogger {
  return new Logger(LOG_CONFIG.DEFAULT_LEVEL, context);
}

