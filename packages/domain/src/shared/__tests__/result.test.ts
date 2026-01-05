import { describe, test, expect } from 'bun:test';
import { Result } from '../result';

describe('Result', () => {
  describe('Result.ok', () => {
    test('should create a success result', () => {
      const result = Result.ok(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    test('should handle different types', () => {
      const stringResult = Result.ok('hello');
      const objectResult = Result.ok({ id: 1, name: 'test' });
      const nullResult = Result.ok(null);

      expect(stringResult.value).toBe('hello');
      expect(objectResult.value).toEqual({ id: 1, name: 'test' });
      expect(nullResult.value).toBeNull();
    });
  });

  describe('Result.err', () => {
    test('should create a failure result', () => {
      const error = new Error('Something went wrong');
      const result = Result.err(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    test('should handle string errors', () => {
      const result = Result.err('Error message');
      expect(result.error).toBe('Error message');
    });
  });

  describe('Success', () => {
    test('map should transform the value', () => {
      const result = Result.ok(10);
      const mapped = result.map((x) => x * 2);

      expect(mapped.isSuccess).toBe(true);
      if (mapped.isSuccess) {
        expect(mapped.value).toBe(20);
      }
    });

    test('flatMap should chain results', () => {
      const result = Result.ok(10);
      const chained = result.flatMap((x) => Result.ok(x * 2));

      expect(chained.isSuccess).toBe(true);
      if (chained.isSuccess) {
        expect(chained.value).toBe(20);
      }
    });

    test('flatMap should propagate failures', () => {
      const result = Result.ok(10);
      const error = new Error('Failed');
      const chained = result.flatMap(() => Result.err(error));

      expect(chained.isFailure).toBe(true);
      if (chained.isFailure) {
        expect(chained.error).toBe(error);
      }
    });

    test('getOrElse should return value', () => {
      const result = Result.ok(42);
      expect(result.getOrElse(0)).toBe(42);
    });
  });

  describe('Failure', () => {
    test('map should not transform failure', () => {
      const result = Result.err(new Error('Error'));
      const mapped = result.map(() => 0);

      expect(mapped.isFailure).toBe(true);
    });

    test('flatMap should not transform failure', () => {
      const result = Result.err(new Error('Error'));
      const chained = result.flatMap(() => Result.ok(0));

      expect(chained.isFailure).toBe(true);
    });

    test('getOrElse should return default value', () => {
      const result = Result.err(new Error('Error'));
      expect(result.getOrElse(0)).toBe(0);
    });
  });

  describe('Result.combine', () => {
    test('should combine multiple success results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.combine(results);

      expect(combined.isSuccess).toBe(true);
      if (combined.isSuccess) {
        expect(combined.value).toEqual([1, 2, 3]);
      }
    });

    test('should return first failure if any result fails', () => {
      const error = new Error('Failed');
      const results = [Result.ok(1), Result.err(error), Result.ok(3)];
      const combined = Result.combine(results);

      expect(combined.isFailure).toBe(true);
      if (combined.isFailure) {
        expect(combined.error).toBe(error);
      }
    });

    test('should return empty array for empty input', () => {
      const combined = Result.combine([]);
      expect(combined.isSuccess).toBe(true);
      if (combined.isSuccess) {
        expect(combined.value).toEqual([]);
      }
    });
  });
});

