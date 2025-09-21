import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input } from '../../../components/ui';
import { useAuth } from '../../auth/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { profileFormSchema } from '../../../lib/validations/settings';
import type { ProfileFormData } from '../types';
import styles from './ProfileSettings.module.css';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { 
    updateProfile, 
    isUpdatingProfile, 
    profileUpdateSuccess 
  } = useSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: '',
      email: '',
    },
  });

  // Set initial values when user data is available
  useEffect(() => {
    if (user) {
      setValue('display_name', user.profile?.display_name || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  // Reset form on successful update
  useEffect(() => {
    if (profileUpdateSuccess) {
      reset({
        display_name: user?.profile?.display_name || '',
        email: user?.email || '',
      });
    }
  }, [profileUpdateSuccess, user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Information</h2>
        <p className={styles.subtitle}>
          Update your personal information and account details
        </p>
      </div>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            
            <div className={styles.field}>
              <Input
                {...register('display_name')}
                label="Display Name"
                placeholder="Enter your display name"
                error={errors.display_name?.message}
                fullWidth
              />
            </div>

            <div className={styles.field}>
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                error={errors.email?.message}
                helperText="Changing your email will require verification"
                fullWidth
              />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Information</h3>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>User ID</label>
                <div className={styles.infoValue}>
                  <code>{user?.id}</code>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Account Created</label>
                <div className={styles.infoValue}>
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Last Updated</label>
                <div className={styles.infoValue}>
                  {user?.profile?.updated_at 
                    ? new Date(user.profile.updated_at).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              loading={isUpdatingProfile}
              disabled={!isDirty}
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isUpdatingProfile}
              >
                Cancel
              </Button>
            )}
          </div>

          {profileUpdateSuccess && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              Profile updated successfully!
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};