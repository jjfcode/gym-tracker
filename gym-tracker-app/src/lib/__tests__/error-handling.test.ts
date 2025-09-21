import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleError,
  handleSupabaseError,
  handleAuthError,
  handleGenericError,
  isRetryableError,
  ErrorType,
  AppError,
} from '../error-handling';
import { PostgrestError, AuthError } from '@supabase/supabase-js';

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

describe('Error Handling', () => {
  describe('handleSupabaseError', () => {
    it('should handle authentication errors correctly', () => {
      const error: PostgrestError = {
        message: 'invalid_credentials',
        code: 'invalid_credentials',
        details: '',
        hint: '',
      };

      const result = handleSupabaseError(error);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.message).toBe('Invalid email or password. Please check your credentials and try again.');
      expect(result.retryable).toBe(false);
      expect(result.code).toBe('invalid_credentials');
    });

    it('should handle database constraint errors', () => {
      const error: PostgrestError = {
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        details: 'Key (email)=(test@example.com) already exists.',
        hint: '',
      };

      const result = handleSupabaseError(error);

      expect(result.type).toBe(ErrorType.DATABASE);
      expect(result.message).toBe('This entry already exists. Please use different values.');
      expect(result.retryable).toBe(false);
      expect(result.code).toBe('23505');
    });

    it('should handle authorization errors', () => {
      const error: PostgrestError = {
        message: 'insufficient_privilege',
        code: '42501',
        details: '',
        hint: '',
      };

      const result = handleSupabaseError(error);

      expect(result.type).toBe(ErrorType.AUTHORIZATION);
      expect(result.message).toBe('You do not have permission to perform this action.');
      expect(result.retryable).toBe(false);
    });

    it('should handle unknown errors with fallback message', () => {
      const error: PostgrestError = {
        message: 'unknown_error',
        code: 'UNKNOWN_CODE',
        details: '',
        hint: '',
      };

      const result = handleSupabaseError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('An unexpected error occurred. Please try again.');
      expect(result.retryable).toBe(false);
    });
  });

  describe('handleAuthError', () => {
    it('should handle auth errors correctly', () => {
      const error = new Error('too_many_requests') as AuthError;
      error.message = 'too_many_requests';

      const result = handleAuthError(error);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.message).toBe('Too many requests. Please wait a moment before trying again.');
      expect(result.retryable).toBe(true);
    });

    it('should handle invalid credentials', () => {
      const error = new Error('invalid_credentials') as AuthError;
      error.message = 'invalid_credentials';

      const result = handleAuthError(error);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.retryable).toBe(false);
    });
  });

  describe('handleGenericError', () => {
    it('should handle network errors', () => {
      const error = new Error('Failed to fetch');
      error.name = 'NetworkError';

      const result = handleGenericError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.message).toBe('Network connection failed. Please check your internet connection.');
      expect(result.retryable).toBe(true);
    });

    it('should handle timeout errors', () => {
      const error = new Error('Request timeout');
      error.name = 'TimeoutError';

      const result = handleGenericError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.message).toBe('Request timed out. Please try again.');
      expect(result.retryable).toBe(true);
    });

    it('should handle JSON parsing errors', () => {
      const error = new Error('Unexpected token in JSON');

      const result = handleGenericError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Invalid data format received. Please try again.');
      expect(result.retryable).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should handle null/undefined errors', () => {
      const result1 = handleError(null);
      const result2 = handleError(undefined);

      expect(result1.type).toBe(ErrorType.UNKNOWN);
      expect(result2.type).toBe(ErrorType.UNKNOWN);
      expect(result1.retryable).toBe(false);
      expect(result2.retryable).toBe(false);
    });

    it('should handle string errors', () => {
      const result = handleError('Something went wrong');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Something went wrong');
      expect(result.retryable).toBe(false);
    });

    it('should route to appropriate handler based on error type', () => {
      const pgError: PostgrestError = {
        message: 'test error',
        code: '23505',
        details: '',
        hint: '',
      };

      const result = handleError(pgError);

      expect(result.type).toBe(ErrorType.DATABASE);
      expect(result.code).toBe('23505');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable network errors', () => {
      const error: AppError = {
        type: ErrorType.NETWORK,
        message: 'Network error',
        timestamp: new Date().toISOString(),
        retryable: true,
      };

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify non-retryable validation errors', () => {
      const error: AppError = {
        type: ErrorType.VALIDATION,
        message: 'Invalid input',
        timestamp: new Date().toISOString(),
        retryable: false,
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('should identify retryable rate limit errors', () => {
      const error: AppError = {
        type: ErrorType.AUTHENTICATION,
        message: 'Too many requests',
        code: 'too_many_requests',
        timestamp: new Date().toISOString(),
        retryable: false,
      };

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify retryable database timeout errors', () => {
      const error: AppError = {
        type: ErrorType.DATABASE,
        message: 'Server error',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        retryable: false,
      };

      expect(isRetryableError(error)).toBe(true);
    });
  });

  describe('Error categorization', () => {
    it('should categorize authentication errors correctly', () => {
      const authErrors = [
        'invalid_credentials',
        'email_not_confirmed',
        'user_not_found',
        'session_not_found',
      ];

      authErrors.forEach(code => {
        const error: PostgrestError = {
          message: 'auth error',
          code,
          details: '',
          hint: '',
        };

        const result = handleSupabaseError(error);
        expect(result.type).toBe(ErrorType.AUTHENTICATION);
      });
    });

    it('should categorize authorization errors correctly', () => {
      const authzErrors = ['42501', 'PGRST301'];

      authzErrors.forEach(code => {
        const error: PostgrestError = {
          message: 'permission denied',
          code,
          details: '',
          hint: '',
        };

        const result = handleSupabaseError(error);
        expect(result.type).toBe(ErrorType.AUTHORIZATION);
      });
    });

    it('should categorize validation errors correctly', () => {
      const validationErrors = ['23502', '23514'];

      validationErrors.forEach(code => {
        const error: PostgrestError = {
          message: 'validation failed',
          code,
          details: '',
          hint: '',
        };

        const result = handleSupabaseError(error);
        expect(result.type).toBe(ErrorType.VALIDATION);
      });
    });
  });

  describe('Error metadata', () => {
    it('should include timestamp in all errors', () => {
      const error = new Error('test error');
      const result = handleGenericError(error);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should include original error reference', () => {
      const originalError = new Error('original error');
      const result = handleGenericError(originalError);

      expect(result.originalError).toBe(originalError);
    });

    it('should include error details when available', () => {
      const error: PostgrestError = {
        message: 'constraint violation',
        code: '23505',
        details: 'Key (email)=(test@example.com) already exists.',
        hint: 'Use a different email address.',
      };

      const result = handleSupabaseError(error);

      expect(result.details).toBeDefined();
      expect(result.details?.details).toBe(error.details);
      expect(result.details?.hint).toBe(error.hint);
    });
  });
});