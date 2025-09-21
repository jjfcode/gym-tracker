import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile } from './common';

// Authentication types
export interface AuthUser extends SupabaseUser {
  profile?: UserProfile;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Form data types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

// Auth context types
export interface AuthContextType extends AuthState {
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;
  updatePassword: (data: UpdatePasswordFormData) => Promise<void>;
  clearError: () => void;
}

// Auth error types
export interface AuthError {
  message: string;
  code?: string;
}