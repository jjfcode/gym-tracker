import { useCallback, useState } from 'react';
import { handleError, logError, AppError, ErrorType } from '../lib/error-handling';

export interface UseErrorHandlerOptions {
  logErrors?: boolean;
  onError?: (error: AppError) => void;
}

export interface ErrorState {
  error: AppError | null;
  hasError: boolean;
  isRetryable: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { logErrors = true, onError } = options;
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    isRetryable: false,
  });

  const handleErrorCallback = useCallback((error: unknown, context?: Record<string, any>) => {
    const appError = handleError(error);
    
    if (logErrors) {
      logError(appError, context);
    }

    setErrorState({
      error: appError,
      hasError: true,
      isRetryable: appError.retryable,
    });

    if (onError) {
      onError(appError);
    }

    return appError;
  }, [logErrors, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      isRetryable: false,
    });
  }, []);

  const isErrorType = useCallback((type: ErrorType) => {
    return errorState.error?.type === type;
  }, [errorState.error]);

  return {
    ...errorState,
    handleError: handleErrorCallback,
    clearError,
    isErrorType,
  };
}

/**
 * Hook for handling async operations with error handling and loading states
 */
export interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  logErrors?: boolean;
}

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  hasError: boolean;
  isRetryable: boolean;
}

export function useAsyncOperation<T>(options: UseAsyncOperationOptions<T> = {}) {
  const { onSuccess, onError, logErrors = true } = options;
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    hasError: false,
    isRetryable: false,
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      hasError: false,
      isRetryable: false,
    }));

    try {
      const result = await operation();
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
      }));

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const appError = handleError(error);
      
      if (logErrors) {
        logError(appError);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: appError,
        hasError: true,
        isRetryable: appError.retryable,
      }));

      if (onError) {
        onError(appError);
      }

      throw appError;
    }
  }, [onSuccess, onError, logErrors]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      hasError: false,
      isRetryable: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      hasError: false,
      isRetryable: false,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

/**
 * Hook for handling form submissions with error handling
 */
export interface UseFormSubmissionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  resetOnSuccess?: boolean;
}

export function useFormSubmission<T>(options: UseFormSubmissionOptions<T> = {}) {
  const { onSuccess, onError, resetOnSuccess = false } = options;
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    hasError: false,
    isRetryable: false,
  });

  const submit = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      hasError: false,
      isRetryable: false,
    }));

    try {
      const result = await operation();
      
      setState(prev => ({
        ...prev,
        data: resetOnSuccess ? null : result,
        loading: false,
      }));

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const appError = handleError(error);
      
      logError(appError, { context: 'form_submission' });

      setState(prev => ({
        ...prev,
        loading: false,
        error: appError,
        hasError: true,
        isRetryable: appError.retryable,
      }));

      if (onError) {
        onError(appError);
      }

      throw appError;
    }
  }, [onSuccess, onError, resetOnSuccess]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      hasError: false,
      isRetryable: false,
    }));
  }, []);

  return {
    ...state,
    submit,
    clearError,
    isSubmitting: state.loading,
  };
}