import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../auth/AuthContext';
import { ThemeProvider } from '../../../../components/ui/ThemeProvider';
import Dashboard from '../Dashboard';

// Mock the hooks to avoid API calls in tests
vi.mock('../hooks/useTodayWorkout', () => ({
  useTodayWorkout: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../hooks/useWeeklyProgress', () => ({
  useWeeklyProgress: () => ({
    data: {
      completedWorkouts: 2,
      totalWorkouts: 3,
      totalVolume: 1500,
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock the auth hook to return a user
vi.mock('../../../auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  it('renders dashboard with main sections', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Check if main sections are present
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Loading today\'s workout...')).toBeInTheDocument();
  });
});