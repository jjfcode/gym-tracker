import React from 'react';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'spinner' | 'skeleton';
  skeletonType?: 'dashboard' | 'workout' | 'progress' | 'exercise-list' | 'settings' | 'card';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...',
  variant = 'skeleton',
  skeletonType = 'card'
}) => {
  if (variant === 'skeleton') {
    return <SkeletonLoader variant={skeletonType} />;
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};