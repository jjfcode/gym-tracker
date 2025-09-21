import React from 'react';
import { usePreviousPerformance } from '../hooks/usePreviousPerformance';
import { useAppStore } from '../../../store';
import styles from './PreviousPerformance.module.css';

interface PreviousPerformanceProps {
  exerciseSlug: string;
}

const PreviousPerformance: React.FC<PreviousPerformanceProps> = ({
  exerciseSlug,
}) => {
  const { units } = useAppStore();
  const { data: previousData, isLoading, error } = usePreviousPerformance(exerciseSlug);

  if (isLoading) {
    return (
      <div className={styles.previousPerformance}>
        <div className={styles.loading}>Loading previous performance...</div>
      </div>
    );
  }

  if (error || !previousData || previousData.length === 0) {
    return (
      <div className={styles.previousPerformance}>
        <div className={styles.noData}>No previous performance data available</div>
      </div>
    );
  }

  const weightUnit = units === 'metric' ? 'kg' : 'lbs';
  const latestPerformance = previousData[0];

  return (
    <div className={styles.previousPerformance}>
      <h5 className={styles.title}>Previous Performance</h5>
      
      <div className={styles.performanceGrid}>
        <div className={styles.performanceItem}>
          <span className={styles.label}>Last Workout:</span>
          <span className={styles.value}>
            {latestPerformance.best_weight} {weightUnit} × {latestPerformance.best_reps} reps
          </span>
        </div>
        
        {latestPerformance.best_rpe && (
          <div className={styles.performanceItem}>
            <span className={styles.label}>RPE:</span>
            <span className={styles.value}>{latestPerformance.best_rpe}</span>
          </div>
        )}
        
        <div className={styles.performanceItem}>
          <span className={styles.label}>Volume:</span>
          <span className={styles.value}>
            {Math.round(latestPerformance.total_volume)} {weightUnit}
          </span>
        </div>
        
        <div className={styles.performanceItem}>
          <span className={styles.label}>Date:</span>
          <span className={styles.value}>
            {new Date(latestPerformance.workout_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {previousData.length > 1 && (
        <div className={styles.trend}>
          <h6 className={styles.trendTitle}>Recent Trend</h6>
          <div className={styles.trendData}>
            {previousData.slice(0, 3).map((performance, index) => (
              <div key={index} className={styles.trendItem}>
                <span className={styles.trendDate}>
                  {new Date(performance.workout_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className={styles.trendValue}>
                  {performance.best_weight} × {performance.best_reps}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousPerformance;