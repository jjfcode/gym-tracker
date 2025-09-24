import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import type { AuthUser } from '../types/auth';
import { MockAuthProvider } from './MockAuthProvider';

// Mock Supabase client
export const mockSupabaseClient = {
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
};

// Mock auth user
export const mockAuthUser: AuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone_confirmed_at: '2024-01-01T00:00:00Z',
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'test-profile-id',
    user_id: 'test-user-id',
    display_name: 'Test User',
    locale: 'en',
    units: 'imperial',
    theme: 'system',
    timezone: 'America/New_York',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

// Custom render with auth context
export const renderWithAuth = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialUser?: AuthUser | null;
  }
) => {
  const { initialUser, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <MockAuthProvider initialUser={initialUser}>
        {children}
      </MockAuthProvider>
    ),
    ...renderOptions,
  });
};

// Mock successful auth responses
export const mockSuccessfulSignIn = () => {
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: {
      user: mockAuthUser,
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockAuthUser,
      },
    },
    error: null,
  });
};

export const mockSuccessfulSignUp = () => {
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: {
      user: mockAuthUser,
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockAuthUser,
      },
    },
    error: null,
  });
};

export const mockAuthError = (message: string) => {
  const error = new Error(message);
  return { data: { user: null, session: null }, error };
};

// Reset all mocks
export const resetAuthMocks = () => {
  vi.clearAllMocks();
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
};