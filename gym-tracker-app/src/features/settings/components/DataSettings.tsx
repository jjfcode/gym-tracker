import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input, Select } from '../../../components/ui';
import { useSettings } from '../hooks/useSettings';
import { exportOptionsSchema } from '../../../lib/validations/settings';
import type { ExportOptions } from '../types';
import styles from './DataSettings.module.css';

const formatOptions = [
  { value: 'json', label: 'JSON (Recommended)' },
  { value: 'csv', label: 'CSV (Spreadsheet)' },
];

export const DataSettings: React.FC = () => {
  const { exportData, isExportingData, exportSuccess } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExportOptions>({
    resolver: zodResolver(exportOptionsSchema),
    defaultValues: {
      includeWorkouts: true,
      includeWeightLogs: true,
      includePlans: true,
      format: 'json',
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: ExportOptions) => {
    exportData(data);
  };

  const handleQuickExport = () => {
    const quickOptions: ExportOptions = {
      includeWorkouts: true,
      includeWeightLogs: true,
      includePlans: true,
      format: 'json',
    };
    exportData(quickOptions);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Data & Privacy</h2>
        <p className={styles.subtitle}>
          Export your data and manage your privacy settings
        </p>
      </div>

      {/* Data Export */}
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Export Your Data</h3>
          <p className={styles.cardDescription}>
            Download a copy of all your workout data, progress logs, and settings
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>What to Include</h4>
            
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('includeWorkouts')}
                />
                <span className={styles.checkboxMark}></span>
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxLabel}>Workouts & Exercises</span>
                  <span className={styles.checkboxDescription}>
                    All your workout history, exercises, and set data
                  </span>
                </div>
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('includeWeightLogs')}
                />
                <span className={styles.checkboxMark}></span>
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxLabel}>Weight Logs</span>
                  <span className={styles.checkboxDescription}>
                    Your body weight tracking history
                  </span>
                </div>
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('includePlans')}
                />
                <span className={styles.checkboxMark}></span>
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxLabel}>Workout Plans</span>
                  <span className={styles.checkboxDescription}>
                    Your workout plans and training schedules
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Export Format</h4>
            
            <div className={styles.field}>
              <Select
                options={formatOptions}
                value={watchedValues.format}
                onChange={(value) => setValue('format', value as 'json' | 'csv')}
                placeholder="Select format"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Date Range (Optional)</h4>
            <p className={styles.sectionDescription}>
              Leave empty to export all data
            </p>
            
            <div className={styles.dateRange}>
              <div className={styles.field}>
                <Input
                  {...register('dateRange.start')}
                  type="date"
                  label="Start Date"
                  error={errors.dateRange?.start?.message}
                />
              </div>
              
              <div className={styles.field}>
                <Input
                  {...register('dateRange.end')}
                  type="date"
                  label="End Date"
                  error={errors.dateRange?.end?.message}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              loading={isExportingData}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              }
            >
              {isExportingData ? 'Exporting...' : 'Export Data'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handleQuickExport}
              disabled={isExportingData}
            >
              Quick Export (All Data)
            </Button>
          </div>

          {exportSuccess && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              Data exported successfully! Check your downloads folder.
            </div>
          )}
        </form>
      </Card>

      {/* Privacy Information */}
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Privacy & Data Usage</h3>
          <p className={styles.cardDescription}>
            How we handle and protect your data
          </p>
        </div>

        <div className={styles.privacyInfo}>
          <div className={styles.privacyItem}>
            <div className={styles.privacyIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className={styles.privacyContent}>
              <h4 className={styles.privacyTitle}>Data Security</h4>
              <p className={styles.privacyDescription}>
                Your data is encrypted in transit and at rest. We use industry-standard 
                security measures to protect your information.
              </p>
            </div>
          </div>

          <div className={styles.privacyItem}>
            <div className={styles.privacyIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className={styles.privacyContent}>
              <h4 className={styles.privacyTitle}>Data Usage</h4>
              <p className={styles.privacyDescription}>
                We only use your data to provide and improve the app experience. 
                We never sell or share your personal fitness data with third parties.
              </p>
            </div>
          </div>

          <div className={styles.privacyItem}>
            <div className={styles.privacyIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div className={styles.privacyContent}>
              <h4 className={styles.privacyTitle}>Data Portability</h4>
              <p className={styles.privacyDescription}>
                You can export your data at any time in standard formats. 
                Your data belongs to you, and you have full control over it.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Deletion */}
      <Card className={`${styles.card} ${styles.dangerCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Delete Account</h3>
          <p className={styles.cardDescription}>
            Permanently delete your account and all associated data
          </p>
        </div>

        <div className={styles.dangerZone}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18l-2 13H5L3 6z"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div className={styles.dangerContent}>
              <h4 className={styles.dangerTitle}>This action cannot be undone</h4>
              <p className={styles.dangerDescription}>
                Deleting your account will permanently remove all your workout data, 
                progress logs, and settings. Make sure to export your data first if you want to keep it.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <div className={styles.deleteConfirm}>
              <p className={styles.confirmText}>
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <Button
                  variant="danger"
                  onClick={() => {
                    // TODO: Implement account deletion
                    console.log('Account deletion requested');
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, Delete My Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};