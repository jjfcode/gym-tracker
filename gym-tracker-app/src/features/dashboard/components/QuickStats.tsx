import React from 'react';
import { Card } from '../../../components/ui';
import { useAuth } from '../../auth';
import { useTodayWorkout } from '../hooks/useTodayWorkout';
import { useWeeklyProgress } from '../hooks/useWeeklyProgress';
import styles from './QuickStats.module.css';

const QuickStats: React.FC = () => {
  const { user } = useAuth();
  const { data: todayWorkout } = useTodayWorkout();
  const { data: weeklyProgress } = useWeeklyProgress();

  if (!user) return null;

  const completedWorkouts = weeklyProgress?.completedWorkouts || 0;
  const totalWorkouts = weeklyProgress?.totalWorkouts || 0;
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  return (
    <div className={styles.quickStats}>
      <h2 className={styles.title}>This Week</h2>
      
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{completedWorkouts}</div>
          <div className={styles.statLabel}>Workouts Completed</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{completionRate}%</div>
          <div className={styles.statLabel}>Weekly Goal</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {todayWorkout?.is_completed ? '✓' : '○'}
          </div>
          <div className={styles.statLabel}>Today's Workout</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>
            {weeklyProgress?.totalVolume ? `${Math.round(weeklyProgress.totalVolume)}` : '0'}
          </div>
          <div className={styles.statLabel}>Total Volume (lbs)</div>
        </Card>
      </div>
    </div>
  );
};

export default QuickStats;