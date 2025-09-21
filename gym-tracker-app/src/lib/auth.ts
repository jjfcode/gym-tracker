import type { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type {
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
  AuthUser,
} from '../types/auth';
import type { UserProfile } from '../types/common';

// Auth service class
export class AuthService {
  // Sign in with email and password
  static async signIn(data: SignInFormData): Promise<AuthUser> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    if (!authData.user) {
      throw new Error('Authentication failed');
    }

    // Fetch user profile
    const profile = await this.fetchUserProfile(authData.user.id);
    
    return {
      ...authData.user,
      profile,
    };
  }

  // Sign up with email and password
  static async signUp(data: SignUpFormData): Promise<AuthUser> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName || '',
        },
      },
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    // Create user profile
    const profile = await this.createUserProfile(authData.user.id, {
      display_name: data.displayName || '',
      locale: 'en',
      units: 'imperial',
      theme: 'system',
    });

    return {
      ...authData.user,
      profile,
    };
  }

  // Sign out
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Reset password
  static async resetPassword(data: ResetPasswordFormData): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Update password
  static async updatePassword(data: UpdatePasswordFormData): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<AuthUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (!session?.user) {
      return null;
    }

    // Fetch user profile
    const profile = await this.fetchUserProfile(session.user.id);
    
    return {
      ...session.user,
      profile,
    };
  }

  // Fetch user profile
  static async fetchUserProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return undefined;
    }
  }

  // Create user profile
  static async createUserProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .insert({
          user_id: userId,
          display_name: profileData.display_name || '',
          locale: profileData.locale || 'en',
          units: profileData.units || 'imperial',
          theme: profileData.theme || 'system',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return undefined;
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return undefined;
    }
  }

  // Convert Supabase auth errors to user-friendly messages
  static getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Signup is disabled':
        return 'New registrations are currently disabled. Please contact support.';
      case 'Email rate limit exceeded':
        return 'Too many requests. Please wait a moment before trying again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}