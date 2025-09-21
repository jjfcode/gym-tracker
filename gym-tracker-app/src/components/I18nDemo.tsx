import React from 'react';
import { useTranslation, useDateFormatter, useNumberFormatter } from '../hooks/useTranslation';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

export function I18nDemo() {
  const { t } = useTranslation();
  const { formatDate, formatDateTime } = useDateFormatter();
  const { formatNumber, formatWeight } = useNumberFormatter();

  const testDate = new Date('2024-01-15T14:30:00');
  const testWeight = 75.5;
  const testNumber = 1234.56;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🌍 Internationalization Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Language Switcher</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Dropdown:</span>
          <LanguageSwitcher variant="dropdown" />
          <span>Toggle:</span>
          <LanguageSwitcher variant="toggle" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Translations</h2>
        <ul>
          <li><strong>Common:</strong> {t('common.loading')} | {t('common.save')} | {t('common.cancel')}</li>
          <li><strong>Navigation:</strong> {t('navigation.dashboard')} | {t('navigation.workouts')} | {t('navigation.progress')}</li>
          <li><strong>Auth:</strong> {t('auth.signIn')} | {t('auth.signUp')} | {t('auth.email')}</li>
          <li><strong>Settings:</strong> {t('settings.theme')} | {t('settings.language')} | {t('settings.units')}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Pluralization</h2>
        <ul>
          <li>1 day: {t('onboarding.daysPerWeek', { count: 1 })}</li>
          <li>3 days: {t('onboarding.daysPerWeek', { count: 3 })}</li>
          <li>1 set: {t('workouts.targetSets', { count: 1 })}</li>
          <li>5 sets: {t('workouts.targetSets', { count: 5 })}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Interpolation</h2>
        <ul>
          <li>Step: {t('onboarding.step', { current: 2, total: 4 })}</li>
          <li>Plan: {t('onboarding.planDescription', { frequency: 3 })}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Date & Number Formatting</h2>
        <ul>
          <li><strong>Date:</strong> {formatDate(testDate)}</li>
          <li><strong>DateTime:</strong> {formatDateTime(testDate)}</li>
          <li><strong>Number:</strong> {formatNumber(testNumber)}</li>
          <li><strong>Weight (metric):</strong> {formatWeight(testWeight, 'metric')}</li>
          <li><strong>Weight (imperial):</strong> {formatWeight(testWeight * 2.2, 'imperial')}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Units & Dates</h2>
        <ul>
          <li><strong>Weight unit:</strong> {t('units.kg')} / {t('units.lbs')}</li>
          <li><strong>Time units:</strong> {t('units.minutes')} / {t('units.hours')}</li>
          <li><strong>Days:</strong> {t('dates.monday')} / {t('dates.tuesday')}</li>
          <li><strong>Months:</strong> {t('dates.january')} / {t('dates.february')}</li>
        </ul>
      </div>
    </div>
  );
}