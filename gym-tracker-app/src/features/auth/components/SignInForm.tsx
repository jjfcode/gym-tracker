import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { useAuth } from '../useAuth';
import { signInSchema, type SignInFormData } from '../../../lib/validations/auth';
import styles from './AuthForms.module.css';

interface SignInFormProps {
  onSuccess?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToReset?: () => void;
}

export function SignInForm({ onSuccess, onNavigateToSignUp, onNavigateToReset }: SignInFormProps) {
  const { signIn, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      clearError();
      await signIn(data);
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the auth context
      if (error instanceof Error && error.message.includes('credentials')) {
        setFormError('email', { message: 'Invalid email or password' });
        setFormError('password', { message: 'Invalid email or password' });
      }
    }
  };

  return (
    <Card className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
          fullWidth
          autoComplete="email"
          autoFocus
        />

        <Input
          {...register('password')}
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          fullWidth
          autoComplete="current-password"
        />

        <div className={styles.formActions}>
          <Button
            type="submit"
            loading={isLoading || isSubmitting}
            fullWidth
            size="lg"
          >
            Sign In
          </Button>
        </div>

        <div className={styles.formFooter}>
          {onNavigateToReset ? (
            <Button variant="link" onClick={onNavigateToReset}>
              Forgot your password?
            </Button>
          ) : (
            <Link to="/auth/reset-password" className={styles.link}>
              Forgot your password?
            </Link>
          )}
        </div>
      </form>

      <div className={styles.authFooter}>
        <p>
          Don't have an account?{' '}
          {onNavigateToSignUp ? (
            <Button variant="link" onClick={onNavigateToSignUp}>
              Sign up
            </Button>
          ) : (
            <Link to="/auth/signup" className={styles.link}>
              Sign up
            </Link>
          )}
        </p>
      </div>
    </Card>
  );
}