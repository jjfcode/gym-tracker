import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useErrorHandler,
  useAsyncOperation,
  useFormSubmission,
} from '../useErrorHandler';
import { ErrorType } from '../../lib/error-handling';

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  global.console = mockConsole as any;
});

describe('useErrorHandler', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isRetryable).toBe(false);
  });

  it('should handle errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.hasError).toBe(true);
    expect(result.current.error?.message).toBe('Test error');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isRetryable).toBe(false);
  });

  it('should call onError callback', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useErrorHandler({ onError }));

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Test error',
      type: ErrorType.UNKNOWN,
    }));
  });

  it('should check error types correctly', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Network error'));
    });

    expect(result.current.isErrorType(ErrorType.UNKNOWN)).toBe(true);
    expect(result.current.isErrorType(ErrorType.NETWORK)).toBe(false);
  });

  it('should log errors when enabled', () => {
    const { result } = renderHook(() => useErrorHandler({ logErrors: true }));

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should not log errors when disabled', () => {
    const { result } = renderHook(() => useErrorHandler({ logErrors: false }));

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(mockConsole.error).not.toHaveBeenCalled();
  });

  it('should handle error context', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'), { userId: '123' });
    });

    expect(mockConsole.error).toHaveBeenCalledWith(
      '🚨 Application Error:',
      expect.objectContaining({
        context: { userId: '123' },
      })
    );
  });
});

describe('useAsyncOperation', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAsyncOperation());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isRetryable).toBe(false);
  });

  it('should handle successful operations', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    const mockOperation = vi.fn().mockResolvedValue('success');

    await act(async () => {
      const promise = result.current.execute(mockOperation);
      
      // Check loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      
      await promise;
    });

    expect(result.current.data).toBe('success');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should handle failed operations', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));

    await act(async () => {
      try {
        await result.current.execute(mockOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.hasError).toBe(true);
    expect(result.current.error?.message).toBe('Operation failed');
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsyncOperation({ onSuccess }));
    const mockOperation = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockOperation);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith('success');
  });

  it('should call onError callback', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAsyncOperation({ onError }));
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));

    await act(async () => {
      try {
        await result.current.execute(mockOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Operation failed',
    }));
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useAsyncOperation());

    act(() => {
      result.current.execute(vi.fn().mockRejectedValue(new Error('Test')));
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should clear errors only', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'));

    await act(async () => {
      try {
        await result.current.execute(mockOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isRetryable).toBe(false);
  });
});

describe('useFormSubmission', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFormSubmission());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should handle successful form submission', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useFormSubmission({ onSuccess }));
    const mockSubmit = vi.fn().mockResolvedValue({ id: 1, name: 'test' });

    await act(async () => {
      const promise = result.current.submit(mockSubmit);
      
      // Check submitting state
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.loading).toBe(true);
      
      await promise;
    });

    expect(result.current.data).toEqual({ id: 1, name: 'test' });
    expect(result.current.loading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith({ id: 1, name: 'test' });
  });

  it('should reset data on success when resetOnSuccess is true', async () => {
    const { result } = renderHook(() => useFormSubmission({ resetOnSuccess: true }));
    const mockSubmit = vi.fn().mockResolvedValue({ id: 1, name: 'test' });

    await act(async () => {
      await result.current.submit(mockSubmit);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle form submission errors', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useFormSubmission({ onError }));
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Validation failed'));

    await act(async () => {
      try {
        await result.current.submit(mockSubmit);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.hasError).toBe(true);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation failed',
    }));
  });

  it('should clear form errors', async () => {
    const { result } = renderHook(() => useFormSubmission());
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Validation failed'));

    await act(async () => {
      try {
        await result.current.submit(mockSubmit);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should log errors with form submission context', async () => {
    const { result } = renderHook(() => useFormSubmission());
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Validation failed'));

    await act(async () => {
      try {
        await result.current.submit(mockSubmit);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(mockConsole.error).toHaveBeenCalledWith(
      '🚨 Application Error:',
      expect.objectContaining({
        context: 'form_submission',
      })
    );
  });
});