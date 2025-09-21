import React from 'react';
import { Skeleton } from '../Skeleton/Skeleton';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  variant: 'dashboard' | 'workout' | 'progress' | 'exercise-list' | 'settings' | 'card';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1 }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className={styles.dashboard}>
            <Skeleton height="2rem" width="60%" />
            <div className={styles.statsGrid}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.statCard}>
                  <Skeleton height="1rem" width="40%" />
                  <Skeleton height="2rem" width="80%" />
                </div>
              ))}
            </div>
            <div className={styles.workoutSection}>
              <Skeleton height="1.5rem" width="50%" />
              <div className={styles.exerciseList}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.exerciseItem}>
                    <Skeleton height="1.2rem" width="70%" />
                    <Skeleton height="0.8rem" width="40%" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'workout':
        return (
          <div className={styles.workout}>
            <Skeleton height="2rem" width="80%" />
            <div className={styles.exerciseCards}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.exerciseCard}>
                  <Skeleton height="1.5rem" width="60%" />
                  <div className={styles.sets}>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className={styles.setRow}>
                        <Skeleton height="2rem" width="60px" />
                        <Skeleton height="2rem" width="60px" />
                        <Skeleton height="2rem" width="60px" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className={styles.progress}>
            <Skeleton height="2rem" width="50%" />
            <div className={styles.chartArea}>
              <Skeleton height="300px" width="100%" />
            </div>
            <div className={styles.statsRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.statItem}>
                  <Skeleton height="1rem" width="60%" />
                  <Skeleton height="1.5rem" width="80%" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'exercise-list':
        return (
          <div className={styles.exerciseList}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.exerciseListItem}>
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className={styles.exerciseInfo}>
                  <Skeleton height="1.2rem" width="70%" />
                  <Skeleton height="0.8rem" width="50%" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className={styles.settings}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  <Skeleton height="1.2rem" width="60%" />
                  <Skeleton height="0.8rem" width="80%" />
                </div>
                <Skeleton height="2rem" width="80px" />
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={styles.card}>
            <Skeleton height="1.5rem" width="70%" />
            <Skeleton height="1rem" width="90%" />
            <Skeleton height="1rem" width="60%" />
          </div>
        );

      default:
        return <Skeleton />;
    }
  };

  return (
    <div className={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};