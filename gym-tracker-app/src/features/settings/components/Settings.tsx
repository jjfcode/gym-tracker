import React from 'react';
import { Card } from '../../../components/ui';
import { SettingsNavigation } from './SettingsNavigation';
import { ProfileSettings } from './ProfileSettings';
import { PreferencesSettings } from './PreferencesSettings';
import { SecuritySettings } from './SecuritySettings';
import { DataSettings } from './DataSettings';
import { useSettings } from '../hooks/useSettings';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const { activeSection, setActiveSection, error, clearError } = useSettings();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Manage your account preferences and data
        </p>
      </div>

      {error && (
        <Card className={styles.errorCard}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className={styles.errorText}>
              <p>{error}</p>
            </div>
            <button
              onClick={clearError}
              className={styles.errorClose}
              aria-label="Dismiss error"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </Card>
      )}

      <div className={styles.content}>
        <div className={styles.navigation}>
          <SettingsNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        <div className={styles.main}>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;