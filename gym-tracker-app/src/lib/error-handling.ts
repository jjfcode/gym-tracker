import { PostgrestError, AuthError } from '@supabase/supabase-js';

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  retryable: boolean;
}

// Supabase error code mappings to user-friendly messages
const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
  'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
  'signup_disabled': 'New account registration is currently disabled.',
  'email_address_invalid': 'Please enter a valid email address.',
  'password_too_short': 'Password must be at least 8 characters long.',
  'weak_password': 'Password is too weak. Please use a stronger password with mixed case letters, numbers, and symbols.',
  'email_address_not_authorized': 'This email address is not authorized to access the application.',
  'too_many_requests': 'Too many requests. Please wait a moment before trying again.',
  'user_not_found': 'No account found with this email address.',
  'session_not_found': 'Your session has expired. Please sign in again.',

  // Database errors (PostgreSQL error codes)
  '23505': 'This entry already exists. Please use different values.',
  '23503': 'Cannot delete this item because it is referenced by other data.',
  '23502': 'Required information is missing. Please fill in all required fields.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'The requested resource was not found.',
  'PGRST116': 'No data found matching your request.',
  'PGRST301': 'You do not have permission to access this data.',
  'PGRST204': 'The requested data could not be found.',

  // Network and connection errors
  'NETWORK_ERROR': 'Network connection failed. Please check your internet connection and try again.',
  'TIMEOUT_ERROR': 'The request timed out. Please try again.',
  'SERVER_ERROR': 'Server is temporarily unavailable. Please try again later.',
};

// Default error messages by type
const DEFAULT_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
  [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorType.VALIDATION]: 'Please check your input and try again.',
  [ErrorType.NETWORK]: 'Network error. Please check your connection and try again.',
  [ErrorType.DATABASE]: 'Database error. Please try again later.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Determines if an error is retryable based on its type and code
 */
export function isRetryableError(error: AppError): boolean {
  // Network errors are generally retryable
  if (error.type === ErrorType.NETWORK) {
    return true;
  }

  // Some database errors are retryable (temporary issues)
  if (error.type === ErrorType.DATABASE) {
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
    return retryableCodes.includes(error.code || '');
  }

  // Rate limiting is retryable after a delay
  if (error.code === 'too_many_requests') {
    return true;
  }

  return false;
}

/**
 * Categorizes error type based on error code and message
 */
function categorizeError(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Check for authentication errors
  if (error.message?.includes('auth') || 
      error.message?.includes('login') || 
      error.message?.includes('credentials') ||
      ['invalid_credentials', 'email_not_confirmed', 'user_not_found', 'session_not_found'].includes(error.code)) {
    return ErrorType.AUTHENTICATION;
  }

  // Check for authorization errors
  if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }

  // Check for validation errors
  if (error.code === '23502' || error.code === '23514' || error.message?.includes('validation')) {
    return ErrorType.VALIDATION;
  }

  // Check for network errors
  if (error.message?.includes('network') || 
      error.message?.includes('fetch') || 
      error.message?.includes('connection') ||
      error.message?.includes('timeout') ||
      error.name === 'NetworkError' ||
      error.name === 'TimeoutError') {
    return ErrorType.NETWORK;
  }

  // Database errors
  if (error.code?.startsWith('23') || error.code?.startsWith('42') || error.code?.startsWith('PGRST')) {
    return ErrorType.DATABASE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Converts Supabase PostgrestError to AppError
 */
export function handleSupabaseError(error: PostgrestError): AppError {
  const type = categorizeError(error);
  const message = SUPABASE_ERROR_MESSAGES[error.code] || 
                  SUPABASE_ERROR_MESSAGES[error.message] || 
                  DEFAULT_ERROR_MESSAGES[type];

  return {
    type,
    message,
    originalError: error,
    code: error.code,
    details: error.details ? { details: error.details, hint: error.hint } : undefined,
    timestamp: new Date().toISOString(),
    retryable: isRetryableError({ type, code: error.code } as AppError),
  };
}

/**
 * Converts Supabase AuthError to AppError
 */
export function handleAuthError(error: AuthError): AppError {
  const type = ErrorType.AUTHENTICATION;
  const message = SUPABASE_ERROR_MESSAGES[error.message] || 
                  DEFAULT_ERROR_MESSAGES[type];

  return {
    type,
    message,
    originalError: error,
    code: error.message,
    timestamp: new Date().toISOString(),
    retryable: error.message === 'too_many_requests',
  };
}

/**
 * Handles generic JavaScript errors
 */
export function handleGenericError(error: Error): AppError {
  const type = categorizeError(error);
  let message = error.message; // Use original message by default

  // Handle specific error types with custom messages
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    message = 'Network connection failed. Please check your internet connection.';
  } else if (error.name === 'TimeoutError') {
    message = 'Request timed out. Please try again.';
  } else if (error.message.includes('JSON')) {
    message = 'Invalid data format received. Please try again.';
  } else if (!error.message || error.message.trim() === '') {
    // Only use default message if no message is provided
    message = DEFAULT_ERROR_MESSAGES[type];
  }

  return {
    type,
    message,
    originalError: error,
    code: error.name,
    timestamp: new Date().toISOString(),
    retryable: isRetryableError({ type, code: error.name } as AppError),
  };
}

/**
 * Main error handler that routes to appropriate handler based on error type
 */
export function handleError(error: unknown): AppError {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: DEFAULT_ERROR_MESSAGES[ErrorType.UNKNOWN],
      timestamp: new Date().toISOString(),
      retryable: false,
    };
  }

  // Handle Supabase PostgrestError
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const pgError = error as PostgrestError;
    if (pgError.code && pgError.message) {
      return handleSupabaseError(pgError);
    }
  }

  // Handle Supabase AuthError
  if (error instanceof Error && error.constructor.name === 'AuthError') {
    return handleAuthError(error as AuthError);
  }

  // Handle generic JavaScript Error
  if (error instanceof Error) {
    return handleGenericError(error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      timestamp: new Date().toISOString(),
      retryable: false,
    };
  }

  // Fallback for unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: DEFAULT_ERROR_MESSAGES[ErrorType.UNKNOWN],
    originalError: error as Error,
    timestamp: new Date().toISOString(),
    retryable: false,
  };
}

/**
 * Logs error with structured format
 */
export function logError(error: AppError, context?: Record<string, any>) {
  const logData = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  if (error.type === ErrorType.NETWORK || error.type === ErrorType.DATABASE) {
    console.warn('⚠️ Recoverable Error:', logData);
  } else {
    console.error('🚨 Application Error:', logData);
  }

  // TODO: Send to error reporting service
  // Example: Sentry.captureException(error.originalError, { extra: logData });
}

/**
 * Creates a user-friendly error message for display in UI
 */
export function getDisplayMessage(error: AppError): string {
  return error.message;
}

/**
 * Sanitizes error for safe display (removes sensitive information)
 */
export function sanitizeError(error: AppError): Omit<AppError, 'originalError' | 'details'> {
  const { originalError, details, ...safeError } = error;
  return safeError;
}