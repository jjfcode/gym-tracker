import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withRetry,
  createRetryWrapper,
  retrySupabaseOperation,
  CircuitBreaker,
  RETRY_PRESETS,
} from '../retry-utils';
import { ErrorType } from '../error-handling';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Retry Utils', () => {
  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const result = await withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 1, // Very short delay for tests
        retryCondition: () => true, // Force retry for test
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Validation error'));

      await expect(withRetry(mockFn, {
        retryCondition: () => false,
      })).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect maxAttempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 1,
        retryCondition: () => true,
      })).rejects.toThrow();
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      const onRetry = vi.fn();

      await withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 1,
        retryCondition: () => true,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should use exponential backoff', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      await withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 1,
        backoffFactor: 2,
        retryCondition: () => true,
        onRetry,
      });

      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapped function with retry logic', async () => {
      const originalFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const wrappedFn = createRetryWrapper(originalFn, {
        maxAttempts: 2,
        baseDelay: 1,
        retryCondition: () => true,
      });

      const result = await wrappedFn('arg1', 'arg2');

      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledTimes(2);
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('retrySupabaseOperation', () => {
    it('should handle successful Supabase operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: { id: 1, name: 'test' },
        error: null,
      });

      const result = await retrySupabaseOperation(mockOperation);

      expect(result.data).toEqual({ id: 1, name: 'test' });
      expect(result.error).toBeNull();
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle Supabase operation with error', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      });

      const result = await retrySupabaseOperation(mockOperation);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(ErrorType.DATABASE);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable Supabase errors', async () => {
      const mockOperation = vi.fn()
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'NETWORK_ERROR', message: 'network failed' },
        })
        .mockResolvedValue({
          data: { id: 1 },
          error: null,
        });

      const result = await retrySupabaseOperation(mockOperation, {
        maxAttempts: 2,
        baseDelay: 1,
      });

      expect(result.data).toEqual({ id: 1 });
      expect(result.error).toBeNull();
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow operations when circuit is closed', async () => {
      const circuitBreaker = new CircuitBreaker(3, 1000);
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(circuitBreaker.getState().state).toBe('CLOSED');
    });

    it('should open circuit after failure threshold', async () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const mockFn = vi.fn().mockRejectedValue(new Error('failure'));

      // First failure
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      expect(circuitBreaker.getState().state).toBe('CLOSED');

      // Second failure - should open circuit
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      expect(circuitBreaker.getState().state).toBe('OPEN');

      // Third attempt should fail immediately
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is OPEN');
      expect(mockFn).toHaveBeenCalledTimes(2); // Not called on third attempt
    });

    it('should transition to half-open after recovery timeout', async () => {
      const circuitBreaker = new CircuitBreaker(1, 100); // Short timeout for test
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('failure'))
        .mockResolvedValue('success');

      // Trigger circuit open
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      expect(circuitBreaker.getState().state).toBe('OPEN');

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should transition to half-open and succeed
      const result = await circuitBreaker.execute(mockFn);
      expect(result).toBe('success');
      expect(circuitBreaker.getState().state).toBe('CLOSED');
    });

    it('should reset circuit state', () => {
      const circuitBreaker = new CircuitBreaker(1, 1000);
      
      // Manually set some state
      circuitBreaker['failures'] = 5;
      circuitBreaker['state'] = 'OPEN';

      circuitBreaker.reset();

      const state = circuitBreaker.getState();
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('RETRY_PRESETS', () => {
    it('should have correct preset configurations', () => {
      expect(RETRY_PRESETS.QUICK.maxAttempts).toBe(2);
      expect(RETRY_PRESETS.STANDARD.maxAttempts).toBe(3);
      expect(RETRY_PRESETS.AGGRESSIVE.maxAttempts).toBe(5);
      expect(RETRY_PRESETS.BACKGROUND.maxAttempts).toBe(10);

      expect(RETRY_PRESETS.QUICK.baseDelay).toBe(500);
      expect(RETRY_PRESETS.STANDARD.baseDelay).toBe(1000);
      expect(RETRY_PRESETS.BACKGROUND.baseDelay).toBe(2000);
    });
  });
});