import React from 'react';
import styles from './BottomNavigation.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}

interface BottomNavigationProps {
  items?: NavItem[];
  onItemClick?: (item: NavItem) => void;
}

// Default navigation items - these will be updated when routing is implemented
const defaultItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    isActive: true,
  },
  {
    id: 'workouts',
    label: 'Workouts',
    href: '/workouts',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6.5 6.5 11 11"></path>
        <path d="m21 21-1-1"></path>
        <path d="m3 3 1 1"></path>
        <path d="m18 22 4-4"></path>
        <path d="m2 6 4-4"></path>
        <path d="m3 10 7-7"></path>
        <path d="m14 21 7-7"></path>
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    href: '/progress',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"></path>
        <path d="m19 9-5 5-4-4-3 3"></path>
      </svg>
    ),
  },
  {
    id: 'planning',
    label: 'Planning',
    href: '/planning',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultItems,
  onItemClick,
}) => {
  const handleItemClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    // Default behavior - this will be enhanced when routing is added
    console.log(`Navigate to ${item.href}`);
  };

  return (
    <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
      <div className={styles.container}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.item} ${item.isActive ? styles.active : ''}`}
            onClick={() => handleItemClick(item)}
            aria-label={item.label}
            aria-current={item.isActive ? 'page' : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;