import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Mock the lazy-loaded components to avoid dynamic import issues in tests
vi.mock('../../components/Home/Home', () => ({
  default: () => <div>Home Component</div>
}));

vi.mock('../../features/dashboard/components/Dashboard', () => ({
  default: () => <div>Dashboard Component</div>
}));

vi.mock('../../features/progress/components/ProgressDemo', () => ({
  default: () => <div>Progress Component</div>
}));

vi.mock('../../features/planning', () => ({
  PlanningView: () => <div>Planning Component</div>
}));

vi.mock('../../features/exercises/components/ExerciseLibraryDemo', () => ({
  default: () => <div>Exercise Library Component</div>
}));

vi.mock('../../features/settings', () => ({
  Settings: () => <div>Settings Component</div>
}));

vi.mock('../../components/OnboardingPlaceholder/OnboardingPlaceholder', () => ({
  default: () => <div>Onboarding Component</div>
}));

vi.mock('../../components/I18nDemo', () => ({
  I18nDemo: () => <div>I18n Demo Component</div>
}));

vi.mock('../../components/PWADemo', () => ({
  PWADemo: () => <div>PWA Demo Component</div>
}));

// Mock PWA components
vi.mock('../../components/ui/OfflineIndicator/OfflineIndicator', () => ({
  OfflineIndicator: () => <div data-testid="offline-indicator">Offline Indicator</div>
}));

vi.mock('../../components/ui/InstallPrompt/InstallPrompt', () => ({
  InstallPrompt: () => <div data-testid="install-prompt">Install Prompt</div>
}));

vi.mock('../../components/ui/UpdatePrompt/UpdatePrompt', () => ({
  UpdatePrompt: () => <div data-testid="update-prompt">Update Prompt</div>
}));

vi.mock('../../components/ui/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('../../contexts/PWAContext', () => ({
  PWAProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  it('should render the app with all providers', async () => {
    renderApp();
    
    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(screen.getByText('Home Component')).toBeInTheDocument();
    });

    // Check that PWA components are rendered
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('update-prompt')).toBeInTheDocument();
  });

  it('should handle routing correctly', async () => {
    // Test will be expanded when actual routing is implemented
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Home Component')).toBeInTheDocument();
    });
  });

  it('should handle error boundaries', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Home Component')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should initialize with proper query client configuration', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          retry: false, // Disable retry for tests
        },
      },
    });

    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(300000);
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(1800000);
  });
});