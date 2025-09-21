import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Select } from '../../../components/ui';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { useSettings } from '../hooks/useSettings';
import { preferencesFormSchema } from '../../../lib/validations/settings';
import type { PreferencesFormData } from '../types';
import styles from './PreferencesSettings.module.css';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const unitOptions = [
  { value: 'imperial', label: 'Imperial (lbs, ft)' },
  { value: 'metric', label: 'Metric (kg, cm)' },
];

export const PreferencesSettings: React.FC = () => {
  const { 
    currentPreferences,
    updatePreferences, 
    isUpdatingPreferences, 
    preferencesUpdateSuccess 
  } = useSettings();

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
    setValue,
    watch,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: currentPreferences,
  });

  const watchedValues = watch();

  // Update form when preferences change
  useEffect(() => {
    reset(currentPreferences);
  }, [currentPreferences, reset]);

  // Reset form on successful update
  useEffect(() => {
    if (preferencesUpdateSuccess) {
      reset(currentPreferences);
    }
  }, [preferencesUpdateSuccess, currentPreferences, reset]);

  const onSubmit = (data: PreferencesFormData) => {
    updatePreferences(data);
  };

  const handleQuickUpdate = (field: keyof PreferencesFormData, value: string) => {
    setValue(field, value as any, { shouldDirty: true });
    
    // Auto-submit for immediate feedback
    const updatedData = {
      ...watchedValues,
      [field]: value,
    };
    updatePreferences(updatedData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Preferences</h2>
        <p className={styles.subtitle}>
          Customize your app experience with theme, language, and unit preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Theme Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Appearance</h3>
            <p className={styles.cardDescription}>
              Choose how the app looks and feels
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>Theme</label>
                <p className={styles.preferenceDescription}>
                  Select your preferred color scheme
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <Select
                  options={themeOptions}
                  value={watchedValues.theme}
                  onChange={(value) => handleQuickUpdate('theme', value as string)}
                  placeholder="Select theme"
                />
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>Quick Theme Toggle</label>
                <p className={styles.preferenceDescription}>
                  Use the button below to quickly cycle through themes
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <ThemeToggle variant="button" showLabel />
              </div>
            </div>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Language & Region</h3>
            <p className={styles.cardDescription}>
              Set your language and regional preferences
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>Language</label>
                <p className={styles.preferenceDescription}>
                  Choose your preferred language for the interface
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <Select
                  options={languageOptions}
                  value={watchedValues.language}
                  onChange={(value) => handleQuickUpdate('language', value as string)}
                  placeholder="Select language"
                />
              </div>
            </div>

            <div className={styles.languageNote}>
              <div className={styles.noteIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <p>
                Language changes will be applied immediately. 
                Some text may require a page refresh to update completely.
              </p>
            </div>
          </div>
        </Card>

        {/* Units Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Units & Measurements</h3>
            <p className={styles.cardDescription}>
              Choose your preferred measurement system
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>Unit System</label>
                <p className={styles.preferenceDescription}>
                  Select between metric and imperial units
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <Select
                  options={unitOptions}
                  value={watchedValues.units}
                  onChange={(value) => handleQuickUpdate('units', value as string)}
                  placeholder="Select unit system"
                />
              </div>
            </div>

            <div className={styles.unitsPreview}>
              <h4 className={styles.previewTitle}>Preview</h4>
              <div className={styles.previewGrid}>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Weight:</span>
                  <span className={styles.previewValue}>
                    {watchedValues.units === 'metric' ? '70 kg' : '154 lbs'}
                  </span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Height:</span>
                  <span className={styles.previewValue}>
                    {watchedValues.units === 'metric' ? '175 cm' : '5\'9"'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        {isDirty && (
          <Card className={styles.actionsCard}>
            <div className={styles.actions}>
              <Button
                type="submit"
                loading={isUpdatingPreferences}
              >
                {isUpdatingPreferences ? 'Saving...' : 'Save All Changes'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isUpdatingPreferences}
              >
                Reset Changes
              </Button>
            </div>
          </Card>
        )}

        {preferencesUpdateSuccess && (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
            Preferences updated successfully!
          </div>
        )}
      </form>
    </div>
  );
};