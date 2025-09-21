import { handleError, isRetryableError, AppError } from './error-handling';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: AppError) => boolean;
  onRetry?: (attempt: number, error: AppError) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryCondition: isRetryableError,
  onRetry: () => {},
};

/**
 * Calculates delay for exponential backoff with jitter
 */
function calculateDelay(attempt: number, baseDelay: number, backoffFactor: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleeps for the specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: AppError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleError(error);

      // Don't retry if this is the last attempt
      if (attempt === config.maxAttempts) {
        throw lastError;
      }

      // Don't retry if the error is not retryable
      if (!config.retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay and notify about retry
      const delay = calculateDelay(attempt, config.baseDelay, config.backoffFactor, config.maxDelay);
      config.onRetry(attempt, lastError);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError!;
}

/**
 * Creates a retry wrapper for a function
 */
export function createRetryWrapper<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
) {
  return async (...args: TArgs): Promise<TReturn> => {
    return withRetry(() => fn(...args), options);
  };
}

/**
 * Retry configuration presets for common scenarios
 */
export const RETRY_PRESETS = {
  // Quick retry for user interactions
  QUICK: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffFactor: 1.5,
  } as RetryOptions,

  // Standard retry for API calls
  STANDARD: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
  } as RetryOptions,

  // Aggressive retry for critical operations
  AGGRESSIVE: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  } as RetryOptions,

  // Background sync retry
  BACKGROUND: {
    maxAttempts: 10,
    baseDelay: 2000,
    maxDelay: 60000,
    backoffFactor: 1.5,
  } as RetryOptions,
} as const;

/**
 * Utility for retrying Supabase operations
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = RETRY_PRESETS.STANDARD
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await operation();
      if (error) {
        throw error;
      }
      return data;
    }, options);

    return { data: result, error: null };
  } catch (error) {
    const appError = handleError(error);
    return { data: null, error: appError };
  }
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Global circuit breaker instance for API calls
 */
export const apiCircuitBreaker = new CircuitBreaker(5, 60000);