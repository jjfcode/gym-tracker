import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input } from '../../../components/ui';
import { useAuth } from '../../auth';
import { useSettings } from '../hooks/useSettings';
import { passwordFormSchema } from '../../../lib/validations/settings';
import type { PasswordFormData } from '../types';
import styles from './SecuritySettings.module.css';

export const SecuritySettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    updatePassword, 
    isUpdatingPassword, 
    passwordUpdateSuccess 
  } = useSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Reset form on successful update
  useEffect(() => {
    if (passwordUpdateSuccess) {
      reset();
    }
  }, [passwordUpdateSuccess, reset]);

  const onSubmit = (data: PasswordFormData) => {
    updatePassword(data);
  };

  const handleSignOutAllDevices = async () => {
    if (window.confirm('This will sign you out of all devices. Continue?')) {
      await signOut();
    }
  };

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <h2 className={styles['title']}>Security Settings</h2>
        <p className={styles['subtitle']}>
          Manage your password and account security
        </p>
      </div>

      {/* Password Change */}
      <Card className={styles['card']}>
        <div className={styles['cardHeader']}>
          <h3 className={styles['cardTitle']}>Change Password</h3>
          <p className={styles['cardDescription']}>
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles['form']}>
          <div className={styles['field']}>
            <Input
              {...register('currentPassword')}
              type="password"
              label="Current Password"
              placeholder="Enter your current password"
              {...(errors.currentPassword?.message && { error: errors.currentPassword.message })}
              fullWidth
            />
          </div>

          <div className={styles['field']}>
            <Input
              {...register('newPassword')}
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              {...(errors.newPassword?.message && { error: errors.newPassword.message })}
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              fullWidth
            />
          </div>

          <div className={styles['field']}>
            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              {...(errors.confirmPassword?.message && { error: errors.confirmPassword.message })}
              fullWidth
            />
          </div>

          <div className={styles['actions']}>
            <Button
              type="submit"
              loading={isUpdatingPassword}
              disabled={!isDirty}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
            
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
            )}
          </div>

          {passwordUpdateSuccess && (
            <div className={styles['successMessage']}>
              <div className={styles['successIcon']}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              Password updated successfully!
            </div>
          )}
        </form>
      </Card>

      {/* Account Security */}
      <Card className={styles['card']}>
        <div className={styles['cardHeader']}>
          <h3 className={styles['cardTitle']}>Account Security</h3>
          <p className={styles['cardDescription']}>
            Additional security options for your account
          </p>
        </div>

        <div className={styles['securityOptions']}>
          <div className={styles['securityItem']}>
            <div className={styles['securityInfo']}>
              <h4 className={styles['securityLabel']}>Email Verification</h4>
              <p className={styles['securityDescription']}>
                Your email address is {user?.email_confirmed_at ? 'verified' : 'not verified'}
              </p>
            </div>
            <div className={styles['securityStatus']}>
              {user?.email_confirmed_at ? (
                <div className={styles['statusVerified']}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  Verified
                </div>
              ) : (
                <div className={styles['statusUnverified']}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  Not Verified
                </div>
              )}
            </div>
          </div>

          <div className={styles['securityItem']}>
            <div className={styles['securityInfo']}>
              <h4 className={styles['securityLabel']}>Last Sign In</h4>
              <p className={styles['securityDescription']}>
                {user?.last_sign_in_at 
                  ? `Last signed in on ${new Date(user.last_sign_in_at).toLocaleString()}`
                  : 'Sign in time not available'
                }
              </p>
            </div>
          </div>

          <div className={styles['securityItem']}>
            <div className={styles['securityInfo']}>
              <h4 className={styles['securityLabel']}>Active Sessions</h4>
              <p className={styles['securityDescription']}>
                Sign out of all devices to revoke all active sessions
              </p>
            </div>
            <div className={styles['securityAction']}>
              <Button
                variant="secondary"
                onClick={handleSignOutAllDevices}
              >
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Tips */}
      <Card className={styles['card']}>
        <div className={styles['cardHeader']}>
          <h3 className={styles['cardTitle']}>Security Tips</h3>
        </div>

        <div className={styles['tips']}>
          <div className={styles['tip']}>
            <div className={styles['tipIcon']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className={styles['tipContent']}>
              <h4 className={styles['tipTitle']}>Use a Strong Password</h4>
              <p className={styles['tipDescription']}>
                Choose a password that's at least 8 characters long and includes uppercase letters, 
                lowercase letters, numbers, and special characters.
              </p>
            </div>
          </div>

          <div className={styles['tip']}>
            <div className={styles['tipIcon']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className={styles['tipContent']}>
              <h4 className={styles['tipTitle']}>Keep Your Email Secure</h4>
              <p className={styles['tipDescription']}>
                Make sure your email account is secure since it's used for password resets 
                and important account notifications.
              </p>
            </div>
          </div>

          <div className={styles['tip']}>
            <div className={styles['tipIcon']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className={styles['tipContent']}>
              <h4 className={styles['tipTitle']}>Regular Security Checkups</h4>
              <p className={styles['tipDescription']}>
                Regularly review your account activity and update your password 
                if you suspect any unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};