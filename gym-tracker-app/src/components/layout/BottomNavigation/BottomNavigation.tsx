import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNavigation.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

// Navigation items for the integrated app
const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
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
    id: 'exercises',
    label: 'Exercises',
    href: '/exercises',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H9.5a1 1 0 0 0-1 1v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1v1.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V12a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1V3a1 1 0 0 0-1-1z"></path>
        <path d="M5 2v20"></path>
        <path d="M19 2v20"></path>
      </svg>
    ),
  },
];

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item: NavItem) => {
    navigate(item.href);
  };

  return (
    <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
      <div className={styles.container}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => handleItemClick(item)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;