import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeightLogger from '../WeightLogger/WeightLogger';
import { useAppStore } from '../../../../store/appStore';

// Mock the store
vi.mock('../../../../store/appStore');
const mockUseAppStore = vi.mocked(useAppStore);

// Mock the hooks
vi.mock('../../hooks/useWeightData', () => ({
  useUpsertWeightLog: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  }),
  useWeightLogByDate: () => ({
    data: null,
    isLoading: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('WeightLogger', () => {
  beforeEach(() => {
    mockUseAppStore.mockReturnValue({
      units: 'imperial',
      theme: 'light',
      language: 'en',
      isOnboarding: false,
      activeWorkout: null,
      setTheme: vi.fn(),
      setLanguage: vi.fn(),
      setUnits: vi.fn(),
      setIsOnboarding: vi.fn(),
      setActiveWorkout: vi.fn(),
    });
  });

  it('renders weight logger form correctly', () => {
    render(<WeightLogger />, { wrapper: createWrapper() });

    expect(screen.getByText('Log Weight')).toBeInTheDocument();
    expect(screen.getByLabelText(/weight \(lbs\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save weight/i })).toBeInTheDocument();
  });

  it('shows correct unit label based on user preference', () => {
    mockUseAppStore.mockReturnValue({
      units: 'metric',
      theme: 'light',
      language: 'en',
      isOnboarding: false,
      activeWorkout: null,
      setTheme: vi.fn(),
      setLanguage: vi.fn(),
      setUnits: vi.fn(),
      setIsOnboarding: vi.fn(),
      setActiveWorkout: vi.fn(),
    });

    render(<WeightLogger />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/weight \(kg\)/i)).toBeInTheDocument();
  });

  it('allows user to enter weight and note', async () => {
    const user = userEvent.setup();
    render(<WeightLogger />, { wrapper: createWrapper() });

    const weightInput = screen.getByLabelText(/weight \(lbs\)/i);
    const noteInput = screen.getByLabelText(/note \(optional\)/i);

    await user.type(weightInput, '180.5');
    await user.type(noteInput, 'Feeling good today');

    expect(weightInput).toHaveValue(180.5);
    expect(noteInput).toHaveValue('Feeling good today');
  });

  it('shows weight preview when weight is entered', async () => {
    const user = userEvent.setup();
    render(<WeightLogger />, { wrapper: createWrapper() });

    const weightInput = screen.getByLabelText(/weight \(lbs\)/i);
    await user.type(weightInput, '180.5');

    await waitFor(() => {
      expect(screen.getByText('Preview:')).toBeInTheDocument();
      expect(screen.getByText('180.5 lbs')).toBeInTheDocument();
    });
  });

  it('shows today badge when date is today', () => {
    render(<WeightLogger />, { wrapper: createWrapper() });

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('can hide date picker when showDatePicker is false', () => {
    render(<WeightLogger showDatePicker={false} />, { wrapper: createWrapper() });

    expect(screen.queryByLabelText(/date/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    const mockOnCancel = vi.fn();
    render(<WeightLogger onCancel={mockOnCancel} />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});