import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import styles from './ProgressSummary.module.css';

interface ProgressData {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number;
  averageWorkoutDuration: number;
  recentWeightChange: number;
}

interface ProgressSummaryProps {
  data?: ProgressData;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ data }) => {
  if (!data) {
    return (
      <Card className={styles.summaryCard}>
        <h3>Progress Summary</h3>
        <p>No progress data available yet. Start tracking your workouts!</p>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Workouts',
      value: data.totalWorkouts,
      suffix: '',
      color: 'primary'
    },
    {
      label: 'Current Streak',
      value: data.currentStreak,
      suffix: ' days',
      color: 'success'
    },
    {
      label: 'Longest Streak',
      value: data.longestStreak,
      suffix: ' days',
      color: 'info'
    },
    {
      label: 'Total Volume',
      value: Math.round(data.totalVolume),
      suffix: ' kg',
      color: 'warning'
    },
    {
      label: 'Avg Duration',
      value: data.averageWorkoutDuration,
      suffix: ' min',
      color: 'secondary'
    },
    {
      label: 'Weight Change',
      value: data.recentWeightChange > 0 ? `+${data.recentWeightChange.toFixed(1)}` : data.recentWeightChange.toFixed(1),
      suffix: ' kg',
      color: data.recentWeightChange >= 0 ? 'success' : 'error'
    }
  ];

  return (
    <div className={styles.summaryGrid}>
      {stats.map((stat, index) => (
        <Card key={index} className={styles.statCard}>
          <div className={styles.statValue}>
            <span className={`${styles.value} ${styles[stat.color]}`}>
              {stat.value}{stat.suffix}
            </span>
          </div>
          <div className={styles.statLabel}>
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
};