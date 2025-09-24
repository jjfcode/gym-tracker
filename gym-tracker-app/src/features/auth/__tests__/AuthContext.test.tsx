import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import { mockAuthUser, mockSuccessfulSignIn, mockSuccessfulSignUp, resetAuthMocks } from '../../../test/auth-utils';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Mock the auth service
vi.mock('../../../lib/auth', () => ({
  AuthService: {
    getCurrentSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    fetchUserProfile: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  it('provides initial auth state', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('initializes with existing session', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockAuthUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles sign in successfully', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(AuthService.signIn).mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.user).toEqual(mockAuthUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles sign in error', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(AuthService.signIn).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('handles sign up successfully', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(AuthService.signUp).mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signUp({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'Test User',
      });
    });

    expect(result.current.user).toEqual(mockAuthUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles sign out successfully', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(mockAuthUser);
    vi.mocked(AuthService.signOut).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockAuthUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles password reset successfully', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(AuthService.resetPassword).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.resetPassword({
        email: 'test@example.com',
      });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error when clearError is called', async () => {
    const { AuthService } = await import('../../../lib/auth');
    vi.mocked(AuthService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(AuthService.signIn).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger an error
    await act(async () => {
      try {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Test error');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});