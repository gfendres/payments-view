/**
 * Success result wrapper
 */
export class Success<T> {
  readonly isSuccess = true as const;
  readonly isFailure = false as const;

  constructor(readonly value: T) {}

  /**
   * Map the success value to a new type
   */
  map<U>(fn: (value: T) => U): Result<U, never> {
    return Result.ok(fn(this.value));
  }

  /**
   * Flat map the success value
   */
  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  /**
   * Get the value or a default
   */
  getOrElse(_defaultValue: T): T {
    return this.value;
  }
}

/**
 * Failure result wrapper
 */
export class Failure<E> {
  readonly isSuccess = false as const;
  readonly isFailure = true as const;

  constructor(readonly error: E) {}

  /**
   * Map does nothing on failure
   */
  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Failure<E>;
  }

  /**
   * Flat map does nothing on failure
   */
  flatMap<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as unknown as Failure<E>;
  }

  /**
   * Get the value or a default
   */
  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }
}

/**
 * Result type - represents either success or failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Result factory functions
 */
export const Result = {
  /**
   * Create a success result
   */
  ok<T>(value: T): Success<T> {
    return new Success(value);
  },

  /**
   * Create a failure result
   */
  err<E>(error: E): Failure<E> {
    return new Failure(error);
  },

  /**
   * Combine multiple results into one
   */
  combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isFailure) {
        return Result.err(result.error);
      }
      values.push(result.value);
    }
    return Result.ok(values);
  },
};

