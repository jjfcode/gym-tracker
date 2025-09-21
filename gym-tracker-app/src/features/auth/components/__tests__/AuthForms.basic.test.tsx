import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignInForm, SignUpForm, ResetPasswordForm } from '../index';

// Mock the auth context
vi.mock('../../AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    clearError: vi.fn(),
    isLoading: false,
    error: null,
    user: null,
    isAuthenticated: false,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Authentication Forms - Basic Rendering', () => {
  describe('SignInForm', () => {
    it('renders sign in form with all required elements', () => {
      renderWithRouter(<SignInForm />);

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      const { container } = renderWithRouter(<SignInForm />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });
  });

  describe('SignUpForm', () => {
    it('renders sign up form with all required elements', () => {
      renderWithRouter(<SignUpForm />);

      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      const { container } = renderWithRouter(<SignUpForm />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const displayNameInput = screen.getByLabelText(/display name/i);
      expect(displayNameInput).toHaveAttribute('type', 'text');
      expect(displayNameInput).toHaveAttribute('autoComplete', 'name');
      
      const emailInput = screen.getByLabelText(/^email$/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    });
  });

  describe('ResetPasswordForm', () => {
    it('renders reset password form with all required elements', () => {
      renderWithRouter(<ResetPasswordForm />);

      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      const { container } = renderWithRouter(<ResetPasswordForm />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
    });
  });
});