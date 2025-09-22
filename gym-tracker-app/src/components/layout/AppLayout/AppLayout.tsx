import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from '../BottomNavigation';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { Button } from '../../ui/Button/Button';
import { useAuth } from '../../../features/auth/AuthContext';
import styles from './AppLayout.module.css';

const AppLayout: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/workouts':
        return 'Workouts';
      case '/progress':
        return 'Progress';
      case '/planning':
        return 'Planning';
      case '/exercises':
        return 'Exercises';
      case '/settings':
        return 'Settings';
      default:
        return 'Gym Tracker';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{getPageTitle()}</h1>
          </div>
          <div className={styles.headerActions}>
            <ThemeToggle />
            
            {/* User Menu */}
            <div className={styles.userMenu}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={styles.userButton}
              >
                {user?.profile?.full_name || user?.email || 'User'}
              </Button>
              
              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>
                      {user?.profile?.full_name || 'User'}
                    </p>
                    <p className={styles.userEmail}>{user?.email}</p>
                  </div>
                  <hr className={styles.divider} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className={styles.signOutButton}
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      
      <footer className={styles.footer}>
        <BottomNavigation />
      </footer>

      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div 
          className={styles.overlay}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export { AppLayout };
export default AppLayout;
