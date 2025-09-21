import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, eventId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging with more context
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    };

    // Log to console with structured data
    console.group('🚨 React Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Details:', errorDetails);
    console.groupEnd();

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info in state for display
    this.setState({ errorInfo });

    // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
    // this.reportError(errorDetails);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private reportError = (errorDetails: any) => {
    // TODO: Implement error reporting to external service
    // Example: Sentry.captureException(errorDetails);
    console.log('Error reported:', errorDetails);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;

      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '2rem auto',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: '8px',
          backgroundColor: 'var(--color-error-bg, #fef2f2)',
          color: 'var(--color-text, #1f2937)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          
          <h2 style={{ 
            color: 'var(--color-error, #dc2626)', 
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Something went wrong
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-secondary, #6b7280)', 
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {isDevelopment && this.state.error && (
            <details style={{
              marginBottom: '1.5rem',
              textAlign: 'left',
              backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #e5e7eb)',
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{
                fontSize: '0.75rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--color-text, #1f2937)',
              }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorInfo && (
                <pre style={{
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  marginTop: '0.5rem',
                  color: 'var(--color-text-secondary, #6b7280)',
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          {this.state.eventId && (
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary, #6b7280)',
              marginBottom: '1.5rem',
              fontFamily: 'monospace',
            }}>
              Error ID: {this.state.eventId}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.75rem 1.5rem',
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
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-secondary, #6b7280)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary-hover, #4b5563)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary, #6b7280)';
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;