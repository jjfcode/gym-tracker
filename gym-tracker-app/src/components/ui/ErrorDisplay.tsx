import React from 'react';
import { AppError, ErrorType, getDisplayMessage } from '../../lib/error-handling';
import { useTranslation } from '../../hooks/useTranslation';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
}: ErrorDisplayProps) {
  const { t } = useTranslation();

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return '📡';
      case ErrorType.AUTHENTICATION:
        return '🔐';
      case ErrorType.AUTHORIZATION:
        return '🚫';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.DATABASE:
        return '💾';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'var(--color-warning, #f59e0b)';
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'var(--color-error, #dc2626)';
      case ErrorType.VALIDATION:
        return 'var(--color-warning, #f59e0b)';
      case ErrorType.DATABASE:
        return 'var(--color-error, #dc2626)';
      default:
        return 'var(--color-error, #dc2626)';
    }
  };

  return (
    <div
      className={`error-display ${className}`}
      style={{
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${getErrorColor(error.type)}`,
        backgroundColor: 'var(--color-error-bg, #fef2f2)',
        color: 'var(--color-text, #1f2937)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
          {getErrorIcon(error.type)}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: getErrorColor(error.type),
          }}>
            {t(`error.type.${error.type}`, error.type.charAt(0).toUpperCase() + error.type.slice(1) + ' Error')}
          </div>
          
          <div style={{ 
            marginBottom: showDetails || onRetry || onDismiss ? '1rem' : 0,
            lineHeight: '1.5',
          }}>
            {getDisplayMessage(error)}
          </div>

          {showDetails && error.code && (
            <details style={{ marginBottom: '1rem' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary, #6b7280)',
                marginBottom: '0.5rem',
              }}>
                {t('error.details', 'Error Details')}
              </summary>
              <div style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #e5e7eb)',
                color: 'var(--color-text-secondary, #6b7280)',
              }}>
                <div><strong>Code:</strong> {error.code}</div>
                <div><strong>Type:</strong> {error.type}</div>
                <div><strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}</div>
                {error.details && (
                  <div><strong>Details:</strong> {JSON.stringify(error.details, null, 2)}</div>
                )}
              </div>
            </details>
          )}

          {(onRetry || onDismiss) && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onRetry && error.retryable && (
                <button
                  onClick={onRetry}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-primary, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover, #2563eb)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
                  }}
                >
                  {t('error.retry', 'Try Again')}
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary, #6b7280)',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
                    e.currentTarget.style.borderColor = 'var(--color-border-hover, #d1d5db)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                  }}
                >
                  {t('error.dismiss', 'Dismiss')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorAlertProps {
  error: AppError;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ErrorAlert({
  error,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: ErrorAlertProps) {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        maxWidth: '400px',
        zIndex: 1000,
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <ErrorDisplay
        error={error}
        onDismiss={onClose}
        className="shadow-lg"
      />
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

interface LoadingErrorProps {
  error: AppError;
  onRetry?: () => void;
  loading?: boolean;
}

export function LoadingError({ error, onRetry, loading = false }: LoadingErrorProps) {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      minHeight: '200px',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {error.type === ErrorType.NETWORK ? '📡' : '❌'}
      </div>
      
      <h3 style={{ 
        margin: '0 0 0.5rem 0',
        color: 'var(--color-text, #1f2937)',
        fontSize: '1.25rem',
        fontWeight: '600',
      }}>
        {t('error.loading.title', 'Unable to Load Data')}
      </h3>
      
      <p style={{ 
        margin: '0 0 1.5rem 0',
        color: 'var(--color-text-secondary, #6b7280)',
        lineHeight: '1.5',
      }}>
        {getDisplayMessage(error)}
      </p>

      {onRetry && error.retryable && (
        <button
          onClick={onRetry}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? 'var(--color-secondary, #6b7280)' : 'var(--color-primary, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {loading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          )}
          {loading ? t('error.retrying', 'Retrying...') : t('error.retry', 'Try Again')}
        </button>
      )}
      
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}