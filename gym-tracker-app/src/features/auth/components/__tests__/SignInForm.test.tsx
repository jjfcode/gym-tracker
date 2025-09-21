import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { SignInForm } from '../SignInForm';

// Mock the auth context
const mockUseAuth = vi.fn();
vi.mock('../../AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SignInForm', () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();
  const mockSignIn = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    mockOnSuccess.mockClear();
    mockSignIn.mockClear();
    mockClearError.mockClear();
    
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders sign in form correctly', () => {
    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on authentication failure', async () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      isLoading: false,
      error: 'Invalid email or password. Please check your credentials and try again.',
      clearError: mockClearError,
    });

    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<SignInForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });
});