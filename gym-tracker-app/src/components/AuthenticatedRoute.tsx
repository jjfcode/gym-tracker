import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { LoadingSpinner } from './ui/LoadingSpinner/LoadingSpinner';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('AuthenticatedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', !!user);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('User is authenticated, rendering children');
  return <>{children}</>;
};