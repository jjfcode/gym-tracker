import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Select } from '../../../components/ui';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { LanguageSwitcher } from '../../../components/ui/LanguageSwitcher';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../../../hooks/useTranslation';
import { preferencesFormSchema } from '../../../lib/validations/settings';
import type { PreferencesFormData } from '../types';
import styles from './PreferencesSettings.module.css';

export const PreferencesSettings: React.FC = () => {
  const { t } = useTranslation();
  const { 
    currentPreferences,
    updatePreferences, 
    isUpdatingPreferences, 
    preferencesUpdateSuccess 
  } = useSettings();

  const themeOptions = [
    { value: 'light', label: t('settings.light') },
    { value: 'dark', label: t('settings.dark') },
    { value: 'system', label: t('settings.system') },
  ];

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'es', label: t('settings.spanish') },
  ];

  const unitOptions = [
    { value: 'imperial', label: t('settings.imperial') },
    { value: 'metric', label: t('settings.metric') },
  ];

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
        <h2 className={styles.title}>{t('settings.preferences')}</h2>
        <p className={styles.subtitle}>
          {t('settings.preferences')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Theme Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{t('common.appearance') || 'Appearance'}</h3>
            <p className={styles.cardDescription}>
              {t('common.appearance') || 'Choose how the app looks and feels'}
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>{t('settings.theme')}</label>
                <p className={styles.preferenceDescription}>
                  {t('common.selectTheme') || 'Select your preferred color scheme'}
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <Select
                  options={themeOptions}
                  value={watchedValues.theme}
                  onChange={(value) => handleQuickUpdate('theme', value as string)}
                  placeholder={t('common.select')}
                />
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>{t('common.quickToggle') || 'Quick Theme Toggle'}</label>
                <p className={styles.preferenceDescription}>
                  {t('common.quickToggleDesc') || 'Use the button below to quickly cycle through themes'}
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
            <h3 className={styles.cardTitle}>{t('common.languageRegion') || 'Language & Region'}</h3>
            <p className={styles.cardDescription}>
              {t('common.languageRegionDesc') || 'Set your language and regional preferences'}
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>{t('settings.language')}</label>
                <p className={styles.preferenceDescription}>
                  {t('common.chooseLanguage') || 'Choose your preferred language for the interface'}
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <LanguageSwitcher variant="dropdown" />
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>{t('common.quickLanguageToggle') || 'Quick Language Toggle'}</label>
                <p className={styles.preferenceDescription}>
                  {t('common.quickLanguageToggleDesc') || 'Use the toggle below to quickly switch languages'}
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <LanguageSwitcher variant="toggle" />
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
                {t('common.languageChangeNote') || 'Language changes will be applied immediately. Some text may require a page refresh to update completely.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Units Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{t('settings.units')}</h3>
            <p className={styles.cardDescription}>
              {t('common.chooseUnits') || 'Choose your preferred measurement system'}
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceInfo}>
                <label className={styles.preferenceLabel}>{t('settings.units')}</label>
                <p className={styles.preferenceDescription}>
                  {t('common.selectUnits') || 'Select between metric and imperial units'}
                </p>
              </div>
              <div className={styles.preferenceControl}>
                <Select
                  options={unitOptions}
                  value={watchedValues.units}
                  onChange={(value) => handleQuickUpdate('units', value as string)}
                  placeholder={t('common.select')}
                />
              </div>
            </div>

            <div className={styles.unitsPreview}>
              <h4 className={styles.previewTitle}>{t('common.preview') || 'Preview'}</h4>
              <div className={styles.previewGrid}>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>{t('workouts.weight')}:</span>
                  <span className={styles.previewValue}>
                    {watchedValues.units === 'metric' ? '70 kg' : '154 lbs'}
                  </span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>{t('common.height') || 'Height'}:</span>
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
                {isUpdatingPreferences ? t('common.loading') : t('common.save')}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isUpdatingPreferences}
              >
                {t('common.reset')}
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
            {t('common.success')}
          </div>
        )}
      </form>
    </div>
  );
};