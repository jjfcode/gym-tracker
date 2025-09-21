import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from '../ResetPasswordForm';
import { renderWithAuth, resetAuthMocks } from '../../../../test/auth-utils';

// Mock the auth module
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  },
}));

describe('ResetPasswordForm', () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    resetAuthMocks();
    mockOnSuccess.mockClear();
  });

  it('renders reset password form correctly', () => {
    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
  });

  it('validates required email field', async () => {
    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form and shows success message', async () => {
    const { supabase } = await import('../../../../lib/supabase');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    });

    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/click the link in the email/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('displays error message on failure', async () => {
    const { supabase } = await import('../../../../lib/supabase');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: new Error('Email rate limit exceeded'),
    });

    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('allows sending another email from success state', async () => {
    const { supabase } = await import('../../../../lib/supabase');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    });

    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Submit form first
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    });

    // Click "Send Another Email" button
    const sendAnotherButton = screen.getByRole('button', { name: /send another email/i });
    await user.click(sendAnotherButton);

    // Should return to the form
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toHaveAttribute('autoFocus');
  });

  it('shows loading state during submission', async () => {
    const { supabase } = await import('../../../../lib/supabase');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100))
    );

    renderWithAuth(<ResetPasswordForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check that button shows loading state
    expect(submitButton).toBeDisabled();
  });
});