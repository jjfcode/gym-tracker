import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { useAuth } from '../useAuth';
import { signUpSchema, type SignUpFormData } from '../../../lib/validations/auth';
import styles from './AuthForms.module.css';

interface SignUpFormProps {
  onSuccess?: () => void;
  onNavigateToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onNavigateToSignIn }: SignUpFormProps) {
  const { signUp, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      clearError();
      await signUp(data);
      
      // After successful signup, redirect to onboarding
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      // Error is already handled by the auth context
      if (error instanceof Error && error.message.includes('already registered')) {
        setFormError('email', { message: 'An account with this email already exists' });
      }
    }
  };

  return (
    <Card className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Sign up to start tracking your workouts</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        <Input
          {...register('displayName')}
          type="text"
          label="Display Name (Optional)"
          placeholder="Enter your display name"
          error={errors.displayName?.message}
          fullWidth
          autoComplete="name"
          autoFocus
        />

        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
          fullWidth
          autoComplete="email"
        />

        <Input
          {...register('password')}
          type="password"
          label="Password"
          placeholder="Create a password"
          error={errors.password?.message}
          fullWidth
          autoComplete="new-password"
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        />

        <Input
          {...register('confirmPassword')}
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          fullWidth
          autoComplete="new-password"
        />

        <div className={styles.formActions}>
          <Button
            type="submit"
            loading={isLoading || isSubmitting}
            fullWidth
            size="lg"
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className={styles.authFooter}>
        <p>
          Already have an account?{' '}
          {onNavigateToSignIn ? (
            <Button variant="link" onClick={onNavigateToSignIn}>
              Sign in
            </Button>
          ) : (
            <Link to="/auth/signin" className={styles.link}>
              Sign in
            </Link>
          )}
        </p>
      </div>
    </Card>
  );
}