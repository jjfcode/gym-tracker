import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import styles from './AuthGuard.module.css';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={styles['authGuardLoading']}>
        <div className={styles['loadingSpinner']}>
          <div className={styles['spinner']}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    const redirect = redirectTo || '/auth/signin';
    return (
      <Navigate 
        to={redirect} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    const redirect = redirectTo || '/dashboard';
    return (
      <Navigate 
        to={redirect} 
        replace 
      />
    );
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
}