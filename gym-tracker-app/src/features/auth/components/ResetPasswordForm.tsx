import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { useAuth } from '../useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../../lib/validations/auth';
import styles from './AuthForms.module.css';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onNavigateToSignIn?: () => void;
}

export function ResetPasswordForm({ onSuccess, onNavigateToSignIn }: ResetPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError();
      await resetPassword(data);
      setIsEmailSent(true);
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the auth context
    }
  };

  if (isEmailSent) {
    return (
      <Card className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Check Your Email</h1>
          <p className={styles.subtitle}>
            We've sent a password reset link to{' '}
            <strong>{getValues('email')}</strong>
          </p>
        </div>

        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <p>
            Click the link in the email to reset your password. 
            If you don't see the email, check your spam folder.
          </p>
        </div>

        <div className={styles.formActions}>
          <Button
            onClick={() => setIsEmailSent(false)}
            variant="secondary"
            fullWidth
          >
            Send Another Email
          </Button>
        </div>

        <div className={styles.authFooter}>
          {onNavigateToSignIn ? (
            <Button variant="link" onClick={onNavigateToSignIn}>
              Back to Sign In
            </Button>
          ) : (
            <Link to="/auth/signin" className={styles.link}>
              Back to Sign In
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </p>
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

        <div className={styles.formActions}>
          <Button
            type="submit"
            loading={isLoading || isSubmitting}
            fullWidth
            size="lg"
          >
            Send Reset Link
          </Button>
        </div>
      </form>

      <div className={styles.authFooter}>
        <p>
          Remember your password?{' '}
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