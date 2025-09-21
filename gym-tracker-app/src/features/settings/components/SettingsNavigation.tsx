import React from 'react';
import type { SettingsSection } from '../types';
import styles from './SettingsNavigation.module.css';

interface SettingsNavigationProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

interface NavigationItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Personal information and account details',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Theme, language, and unit settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 17a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"></path>
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password and account security',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <circle cx="12" cy="16" r="1"></circle>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
  },
  {
    id: 'data',
    label: 'Data & Privacy',
    description: 'Export data and manage privacy',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10,9 9,9 8,9"></polyline>
      </svg>
    ),
  },
];

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav className={styles.navigation} role="navigation" aria-label="Settings navigation">
      <ul className={styles.list}>
        {navigationItems.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.item} ${
                activeSection === item.id ? styles.active : ''
              }`}
              onClick={() => onSectionChange(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <div className={styles.itemIcon}>{item.icon}</div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{item.label}</div>
                <div className={styles.itemDescription}>{item.description}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};