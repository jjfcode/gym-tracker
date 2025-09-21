import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthGuard, ProtectedRoute, PublicRoute } from '../AuthGuard';
import { renderWithAuth, mockAuthUser, resetAuthMocks } from '../../../test/auth-utils';
import { useAuthStore } from '../../../store/authStore';

// Mock the auth store
vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('AuthGuard', () => {
  const mockUseAuthStore = vi.mocked(useAuthStore);

  beforeEach(() => {
    resetAuthMocks();
    mockUseAuthStore.mockClear();
  });

  it('shows loading state when authentication is loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('redirects to sign in when user is not authenticated and auth is required', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
    });
  });

  it('renders children when user is authenticated and auth is required', () => {
    mockUseAuthStore.mockReturnValue({
      user: mockAuthUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter>
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('redirects to dashboard when user is authenticated but accessing public route', async () => {
    mockUseAuthStore.mockReturnValue({
      user: mockAuthUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/auth/signin']}>
        <AuthGuard requireAuth={false}>
          <div>Public Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/public content/i)).not.toBeInTheDocument();
    });
  });

  it('renders children when user is not authenticated and auth is not required', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter>
        <AuthGuard requireAuth={false}>
          <div>Public Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/public content/i)).toBeInTheDocument();
  });

  it('uses custom redirect path', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthGuard requireAuth={true} redirectTo="/custom-login">
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
    });
  });
});

describe('ProtectedRoute', () => {
  const mockUseAuthStore = vi.mocked(useAuthStore);

  beforeEach(() => {
    resetAuthMocks();
    mockUseAuthStore.mockClear();
  });

  it('works as a protected route wrapper', () => {
    mockUseAuthStore.mockReturnValue({
      user: mockAuthUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  const mockUseAuthStore = vi.mocked(useAuthStore);

  beforeEach(() => {
    resetAuthMocks();
    mockUseAuthStore.mockClear();
  });

  it('works as a public route wrapper', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    renderWithAuth(
      <MemoryRouter>
        <PublicRoute>
          <div>Public Content</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/public content/i)).toBeInTheDocument();
  });
});