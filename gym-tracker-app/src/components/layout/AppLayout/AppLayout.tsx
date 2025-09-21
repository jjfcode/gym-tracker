import React from 'react';
import { BottomNavigation } from '../BottomNavigation';
import { ThemeToggle } from '../../ui/ThemeToggle';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  title?: string;
  headerActions?: React.ReactNode;
  showThemeToggle?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showBottomNav = true,
  title = 'Gym Tracker',
  headerActions,
  showThemeToggle = true,
}) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{title}</h1>
          </div>
          <div className={styles.headerActions}>
            {headerActions}
            {showThemeToggle && <ThemeToggle />}
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
      
      {showBottomNav && (
        <footer className={styles.footer}>
          <BottomNavigation />
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
