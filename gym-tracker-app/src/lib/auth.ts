import type { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { SecurityService } from './security';
import { sanitizeInput } from './input-sanitization';
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
    // Sanitize input data
    const sanitizedEmail = sanitizeInput(data.email, 'email') as string;
    const rateLimitKey = sanitizedEmail;

    // Check rate limiting for login attempts
    if (!SecurityService.checkRateLimit(rateLimitKey, 'login')) {
      await SecurityService.logSecurityEvent('rate_limit_exceeded', {
        email: sanitizedEmail,
        action: 'sign_in',
      }, 'medium');
      throw new Error('Too many login attempts. Please try again later.');
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password,
      });

      if (error) {
        // Log failed login attempt
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          error: error.message,
          timestamp: new Date().toISOString(),
        }, 'medium');
        throw new Error(this.getErrorMessage(error));
      }

      if (!authData.user) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          error: 'No user returned from authentication',
        }, 'medium');
        throw new Error('Authentication failed');
      }

      // Check for suspicious activity
      const isSuspicious = await SecurityService.checkSuspiciousActivity(authData.user.id);
      if (isSuspicious) {
        await SecurityService.logSecurityEvent('suspicious_activity', {
          userId: authData.user.id,
          email: sanitizedEmail,
          action: 'sign_in_suspicious',
        }, 'high');
        // Still allow login but log the event
      }

      // Fetch user profile
      const profile = await this.fetchUserProfile(authData.user.id) || this.createDefaultProfile(authData.user.id);
      
      return {
        ...authData.user,
        profile,
      };
    } catch (error) {
      // Ensure error is logged and re-throw
      if (error instanceof Error && !error.message.includes('Too many login attempts')) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          error: error.message,
        }, 'medium');
      }
      throw error;
    }
  }

  // Sign up with email and password
  static async signUp(data: SignUpFormData): Promise<AuthUser> {
    // Sanitize input data
    const sanitizedEmail = sanitizeInput(data.email, 'email') as string;
    const sanitizedDisplayName = sanitizeInput(data.displayName || '', 'text', { maxLength: 50 }) as string;
    
    // Validate password strength
    const passwordValidation = SecurityService.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    // Check rate limiting for registration attempts
    const rateLimitKey = sanitizedEmail;
    if (!SecurityService.checkRateLimit(rateLimitKey, 'login')) {
      await SecurityService.logSecurityEvent('rate_limit_exceeded', {
        email: sanitizedEmail,
        action: 'sign_up',
      }, 'medium');
      throw new Error('Too many registration attempts. Please try again later.');
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          data: {
            display_name: sanitizedDisplayName,
          },
        },
      });

      if (error) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          action: 'sign_up',
          error: error.message,
        }, 'low');
        throw new Error(this.getErrorMessage(error));
      }

      if (!authData.user) {
        throw new Error('Registration failed');
      }

      // Create user profile with sanitized data
      const profile = await this.createUserProfile(authData.user.id, {
        display_name: sanitizedDisplayName,
        locale: 'en',
        units: 'imperial', // Default to imperial
        theme: 'system',
      }) || this.createDefaultProfile(authData.user.id);

      return {
        ...authData.user,
        profile,
      };
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Too many registration attempts')) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          action: 'sign_up',
          error: error.message,
        }, 'low');
      }
      throw error;
    }
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
    // Sanitize email input
    const sanitizedEmail = sanitizeInput(data.email, 'email') as string;
    
    // Check rate limiting for password reset attempts
    if (!SecurityService.checkRateLimit(sanitizedEmail, 'passwordReset')) {
      await SecurityService.logSecurityEvent('rate_limit_exceeded', {
        email: sanitizedEmail,
        action: 'password_reset',
      }, 'medium');
      throw new Error('Too many password reset attempts. Please try again later.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          action: 'password_reset',
          error: error.message,
        }, 'low');
        throw new Error(this.getErrorMessage(error));
      }

      // Log successful password reset request
      await SecurityService.logSecurityEvent('suspicious_activity', {
        email: sanitizedEmail,
        action: 'password_reset_requested',
      }, 'low');
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Too many password reset attempts')) {
        await SecurityService.logSecurityEvent('failed_login', {
          email: sanitizedEmail,
          action: 'password_reset',
          error: error.message,
        }, 'low');
      }
      throw error;
    }
  }

  // Update password
  static async updatePassword(data: UpdatePasswordFormData): Promise<void> {
    // Validate password strength
    const passwordValidation = SecurityService.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      const { data: { user } } = await supabase.auth.getUser();
      await SecurityService.logSecurityEvent('failed_login', {
        userId: user?.id,
        action: 'password_update',
        error: error.message,
      }, 'medium');
      throw new Error(this.getErrorMessage(error));
    }

    // Log successful password update
    const { data: { user } } = await supabase.auth.getUser();
    await SecurityService.logSecurityEvent('suspicious_activity', {
      userId: user?.id,
      action: 'password_updated',
    }, 'low');
  }

  // Get current session
  static async getCurrentSession(): Promise<AuthUser | null> {
    try {
      console.log('AuthService.getCurrentSession: Starting...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout')), 5000) // Reduced timeout
      );
      
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]);
      
      console.log('AuthService.getCurrentSession: getSession completed', { session: !!session, error: !!error });
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      if (!session?.user) {
        console.log('No session found');
        return null;
      }

      console.log('Session found, fetching profile for user:', session.user.id);
      // Fetch user profile - ensure we always get a profile
      const profile = await this.fetchUserProfile(session.user.id) || this.createDefaultProfile(session.user.id);
      console.log('Profile fetched:', !!profile);
      
      const result = {
        ...session.user,
        profile,
      };
      console.log('AuthService.getCurrentSession: Returning user');
      return result;
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      if (error instanceof Error && error.message === 'getSession timeout') {
        console.log('getSession timed out, assuming no session');
      }
      return null;
    }
  }

  // Fetch user profile
  static async fetchUserProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('fetchUserProfile timeout')), 10000) // Increased timeout to 10 seconds
      );
      
      const profilePromise = supabase
        .from('profile')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);

      if (error) {
        console.log('Profile fetch error:', error);
        // If table doesn't exist, create a default profile
        if (error.code === 'PGRST116' || error.message.includes('relation "profile" does not exist') || error.code === '42P01') {
          console.warn('Profile table does not exist, creating default profile');
          return this.createDefaultProfile(userId);
        }
        // If user doesn't have a profile yet (404 or 406), create default
        if (error.code === 'PGRST116' || error.message.includes('406') || error.details?.includes('No rows found')) {
          console.warn('Profile not found for user, creating default profile');
          return this.createDefaultProfile(userId);
        }
        console.error('Error fetching profile:', error);
        // Return default profile instead of undefined to ensure auth continues
        return this.createDefaultProfile(userId);
      }

      console.log('Profile fetched successfully:', data);
      // Ensure the profile has all required fields
      return {
        id: data.user_id, // Add missing id field
        user_id: data.user_id,
        display_name: data.display_name || '', // Handle null case
        locale: (data.locale as 'en' | 'es') || 'en',
        units: (data.units as 'metric' | 'imperial') || 'imperial',
        theme: (data.theme as 'dark' | 'light' | 'system') || 'system',
        timezone: (data as { timezone?: string }).timezone || 'UTC',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error instanceof Error && error.message === 'fetchUserProfile timeout') {
        console.log('Profile fetch timed out, using default profile');
      }
      // Return default profile instead of undefined to ensure auth continues
      return this.createDefaultProfile(userId);
    }
  }

  // Create a default profile when database table doesn't exist
  static createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      user_id: userId,
      display_name: '',
      locale: 'en',
      units: 'imperial', // Default to imperial
      theme: 'system',
      timezone: 'UTC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
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
          timezone: profileData.timezone || 'UTC',
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, return a default profile
        if (error.code === 'PGRST116' || error.message.includes('relation "profile" does not exist')) {
          console.warn('Profile table does not exist, using default profile');
          return this.createDefaultProfile(userId);
        }
        console.error('Error creating profile:', error);
        return this.createDefaultProfile(userId);
      }

      // Add missing id field
      return {
        id: data.user_id,
        user_id: data.user_id,
        display_name: data.display_name || '',
        locale: (data.locale as 'en' | 'es') || 'en',
        units: (data.units as 'metric' | 'imperial') || 'imperial',
        theme: (data.theme as 'dark' | 'light' | 'system') || 'system',
        timezone: (data as { timezone?: string }).timezone || 'UTC',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      return this.createDefaultProfile(userId);
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
        // If table doesn't exist, return updated default profile
        if (error.code === 'PGRST116' || error.message.includes('relation "profile" does not exist')) {
          console.warn('Profile table does not exist, using default profile with updates');
          return {
            ...this.createDefaultProfile(userId),
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        console.error('Error updating profile:', error);
        return undefined;
      }

      // Add missing id field
      return {
        id: data.user_id,
        user_id: data.user_id,
        display_name: data.display_name || '',
        locale: (data.locale as 'en' | 'es') || 'en',
        units: (data.units as 'metric' | 'imperial') || 'imperial',
        theme: (data.theme as 'dark' | 'light' | 'system') || 'system',
        timezone: (data as { timezone?: string }).timezone || 'UTC',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
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