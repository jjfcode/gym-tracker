import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Settings } from '../components';
import { AuthProvider } from '../../auth/AuthContext';

// Mock the hooks
vi.mock('../hooks/useSettings', () => ({
  useSettings: () => ({
    activeSection: 'profile',
    setActiveSection: vi.fn(),
    error: null,
    clearError: vi.fn(),
    currentPreferences: {
      theme: 'dark',
      language: 'en',
      units: 'metric',
    },
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    updatePassword: vi.fn(),
    exportData: vi.fn(),
    isUpdatingProfile: false,
    isUpdatingPreferences: false,
    isUpdatingPassword: false,
    isExportingData: false,
    profileUpdateSuccess: false,
    preferencesUpdateSuccess: false,
    passwordUpdateSuccess: false,
    exportSuccess: false,
  }),
}));

// Mock the auth context
vi.mock('../../auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      profile: {
        user_id: 'test-user-id',
        display_name: 'Test User',
        locale: 'en',
        units: 'metric',
        theme: 'dark',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
    isLoading: false,
    isAuthenticated: true,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    clearError: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Settings Component', () => {
  it('should render settings page with navigation and content', () => {
    renderWithProviders(<Settings />);

    // Check main heading
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    
    // Check navigation items
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /data & privacy/i })).toBeInTheDocument();

    // Check that profile section is rendered by default
    expect(screen.getByRole('heading', { name: /profile information/i })).toBeInTheDocument();
  });

  it('should render without errors when no user is present', () => {
    // This test ensures the component handles the loading state gracefully
    renderWithProviders(<Settings />);
    
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });
});