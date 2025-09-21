import React from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
}) => {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <div className={styles.content}>
          {showLogo && (
            <div className={styles.logo}>
              <h1 className={styles.logoText}>Gym Tracker</h1>
            </div>
          )}
          
          {(title || subtitle) && (
            <div className={styles.header}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          )}
          
          <div className={styles.form}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;