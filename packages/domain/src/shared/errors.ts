import { ErrorCode } from '@payments-view/constants';

/**
 * Base domain error class
 */
export abstract class DomainError extends Error {
  abstract readonly code: ErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends DomainError {
  readonly code = ErrorCode.VALIDATION_FAILED;

  constructor(
    message: string,
    readonly field?: string
  ) {
    super(message);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends DomainError {
  readonly code = ErrorCode.TRANSACTION_NOT_FOUND;

  constructor(
    readonly entity: string,
    readonly id: string
  ) {
    super(`${entity} with id '${id}' not found`);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends DomainError {
  readonly code = ErrorCode.UNAUTHORIZED;

  constructor(message = 'Unauthorized') {
    super(message);
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends DomainError {
  readonly code = ErrorCode.TOKEN_EXPIRED;

  constructor() {
    super('Token has expired');
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends DomainError {
  readonly code = ErrorCode.GNOSIS_API_ERROR;

  constructor(
    readonly service: string,
    message: string
  ) {
    super(`${service}: ${message}`);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends DomainError {
  readonly code = ErrorCode.RATE_LIMITED;

  constructor(readonly retryAfterMs?: number) {
    super('Rate limit exceeded');
  }
}

