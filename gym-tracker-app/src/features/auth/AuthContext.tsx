import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';
import { AuthContext } from './context';
import type {
  AuthContextType,
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
} from '../../types/auth';

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
      console.log('Starting auth initialization...');
      setLoading(true);
      
      try {
        console.log('Calling getCurrentSession...');
        
        // Add timeout to the entire auth initialization
        const authPromise = AuthService.getCurrentSession();
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => {
            console.log('Auth initialization timeout, resolving with null');
            resolve(null);
          }, 8000)
        );
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log('getCurrentSession completed:', currentUser);
        
        if (mounted) {
          setUser(currentUser);
          console.log('Auth initialized, user set:', !!currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          console.log('Auth initialization failed, user set to null');
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          console.log('Auth state change event:', event, 'session:', !!session);
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, fetching profile...');
            try {
              const profile = await AuthService.fetchUserProfile(session.user.id);
              console.log('Profile fetch completed, profile:', !!profile);
              console.log('Setting user with profile...');
              setUser({
                ...session.user,
                profile: profile || AuthService.createDefaultProfile(session.user.id),
              });
              console.log('User set after sign in, isAuthenticated should now be true');
            } catch (error) {
              console.error('Profile fetch failed, setting user without profile:', error);
              // Set user even if profile fetch fails
              console.log('Setting user with default profile...');
              setUser({
                ...session.user,
                profile: AuthService.createDefaultProfile(session.user.id),
              });
              console.log('User set with default profile');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('Token refreshed, updating user...');
            try {
              const profile = await AuthService.fetchUserProfile(session.user.id);
              setUser({
                ...session.user,
                profile: profile || AuthService.createDefaultProfile(session.user.id),
              });
            } catch (error) {
              console.error('Profile fetch failed on token refresh:', error);
              setUser({
                ...session.user,
                profile: AuthService.createDefaultProfile(session.user.id),
              });
            }
          } else if (event === 'USER_UPDATED' && session?.user) {
            console.log('User updated, refreshing profile...');
            try {
              const profile = await AuthService.fetchUserProfile(session.user.id);
              setUser({
                ...session.user,
                profile: profile || AuthService.createDefaultProfile(session.user.id),
              });
              console.log('Profile updated successfully');
            } catch (error) {
              console.error('Profile fetch failed on user update:', error);
              setUser({
                ...session.user,
                profile: AuthService.createDefaultProfile(session.user.id),
              });
            }
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