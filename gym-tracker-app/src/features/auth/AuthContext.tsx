import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';
import type {
  AuthContextType,
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
} from '../../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await AuthService.getCurrentSession();
        
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await AuthService.fetchUserProfile(session.user.id);
            setUser({
              ...session.user,
              profile,
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            const profile = await AuthService.fetchUserProfile(session.user.id);
            setUser({
              ...session.user,
              profile,
            });
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setError('Authentication error occurred');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setError]);

  // Auth actions
  const signIn = async (data: SignInFormData): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      const user = await AuthService.signIn(data);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
      throw error;
    }
  };

  const signUp = async (data: SignUpFormData): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      const user = await AuthService.signUp(data);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordFormData): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      await AuthService.resetPassword(data);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    }
  };

  const updatePassword = async (data: UpdatePasswordFormData): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      await AuthService.updatePassword(data);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password update failed');
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}