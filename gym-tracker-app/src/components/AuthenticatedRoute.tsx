import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner/LoadingSpinner';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children, 
  requireOnboarding = false 
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