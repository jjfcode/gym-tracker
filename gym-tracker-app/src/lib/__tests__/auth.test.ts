import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth';
import { mockAuthUser } from '../../test/auth-utils';

// Mock the supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('../supabase', () => ({
  supabase: mockSupabase,
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      const mockProfile = mockAuthUser.profile;
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockSupabase.from().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        ...mockAuthUser,
        profile: mockProfile,
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('throws error on authentication failure', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        AuthService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws error when no user returned', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        AuthService.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Authentication failed');
    });
  });

  describe('signUp', () => {
    it('signs up user successfully', async () => {
      const mockProfile = mockAuthUser.profile;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockSupabase.from().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'Test User',
      });

      expect(result).toEqual({
        ...mockAuthUser,
        profile: mockProfile,
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        options: {
          data: {
            display_name: 'Test User',
          },
        },
      });
    });

    it('throws error on registration failure', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(
        AuthService.signUp({
          email: 'existing@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        })
      ).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('signOut', () => {
    it('signs out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(AuthService.signOut()).resolves.toBeUndefined();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('throws error on sign out failure', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      await expect(AuthService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    it('sends reset password email successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      await expect(
        AuthService.resetPassword({ email: 'test@example.com' })
      ).resolves.toBeUndefined();

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: `${window.location.origin}/reset-password` }
      );
    });

    it('throws error on reset password failure', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: { message: 'Email rate limit exceeded' },
      });

      await expect(
        AuthService.resetPassword({ email: 'test@example.com' })
      ).rejects.toThrow('Too many requests');
    });
  });

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      await expect(
        AuthService.updatePassword({
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        })
      ).resolves.toBeUndefined();

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123',
      });
    });

    it('throws error on password update failure', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password update failed' },
      });

      await expect(
        AuthService.updatePassword({
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        })
      ).rejects.toThrow('Password update failed');
    });
  });

  describe('getCurrentSession', () => {
    it('returns current session with profile', async () => {
      const mockProfile = mockAuthUser.profile;
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAuthUser,
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            token_type: 'bearer',
          },
        },
        error: null,
      });

      mockSupabase.from().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthService.getCurrentSession();

      expect(result).toEqual({
        ...mockAuthUser,
        profile: mockProfile,
      });
    });

    it('returns null when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getCurrentSession();
      expect(result).toBeNull();
    });

    it('returns null on session error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      const result = await AuthService.getCurrentSession();
      expect(result).toBeNull();
    });
  });

  describe('getErrorMessage', () => {
    it('converts known error messages', () => {
      expect(AuthService.getErrorMessage({ message: 'Invalid login credentials' }))
        .toBe('Invalid email or password. Please check your credentials and try again.');
      
      expect(AuthService.getErrorMessage({ message: 'Email not confirmed' }))
        .toBe('Please check your email and click the confirmation link before signing in.');
      
      expect(AuthService.getErrorMessage({ message: 'User already registered' }))
        .toBe('An account with this email already exists. Please sign in instead.');
      
      expect(AuthService.getErrorMessage({ message: 'Email rate limit exceeded' }))
        .toBe('Too many requests. Please wait a moment before trying again.');
    });

    it('returns original message for unknown errors', () => {
      expect(AuthService.getErrorMessage({ message: 'Unknown error' }))
        .toBe('Unknown error');
    });

    it('returns default message for empty error', () => {
      expect(AuthService.getErrorMessage({ message: '' }))
        .toBe('An unexpected error occurred. Please try again.');
    });
  });
});