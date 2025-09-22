import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner/LoadingSpinner';
import { WeightChart } from './WeightChart';
import { WorkoutStatsChart } from './WorkoutStatsChart';
import { ProgressSummary } from './ProgressSummary';
import { WeightLogger } from './WeightLogger';
import { useAuth } from '../../auth/AuthContext';
import { progressService } from '../../../lib/progress-service';
import styles from './ProgressTracking.module.css';

type ProgressView = 'overview' | 'weight' | 'workouts' | 'exercises';

const ProgressTracking: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ProgressView>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Get progress data
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progressData', user?.id, timeRange],
    queryFn: () => progressService.getProgressData(user!.id, timeRange),
    enabled: !!user?.id,
  });

  // Get weight history
  const { data: weightHistory } = useQuery({
    queryKey: ['weightHistory', user?.id, timeRange],
    queryFn: () => progressService.getWeightHistory(user!.id, timeRange),
    enabled: !!user?.id,
  });

  // Get workout statistics
  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', user?.id, timeRange],
    queryFn: () => progressService.getWorkoutStats(user!.id, timeRange),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className={styles.overview}>
            <ProgressSummary data={progressData} />
            
            <div className={styles.chartGrid}>
              <Card className={styles.chartCard}>
                <h3>Weight Progress</h3>
                <WeightChart data={weightHistory} timeRange={timeRange} />
              </Card>
              
              <Card className={styles.chartCard}>
                <h3>Workout Statistics</h3>
                <WorkoutStatsChart data={workoutStats} timeRange={timeRange} />
              </Card>
            </div>
          </div>
        );
        
      case 'weight':
        return (
          <div className={styles.weightView}>
            <WeightLogger />
            <Card className={styles.chartCard}>
              <h3>Weight History</h3>
              <WeightChart data={weightHistory} timeRange={timeRange} detailed />
            </Card>
          </div>
        );
        
      case 'workouts':
        return (
          <div className={styles.workoutView}>
            <Card className={styles.chartCard}>
              <h3>Workout Performance</h3>
              <WorkoutStatsChart data={workoutStats} timeRange={timeRange} detailed />
            </Card>
            
            <Card className={styles.statsCard}>
              <h3>Workout Statistics</h3>
              <div className={styles.statGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {workoutStats?.totalWorkouts || 0}
                  </span>
                  <span className={styles.statLabel}>Total Workouts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {workoutStats?.averageDuration || 0}min
                  </span>
                  <span className={styles.statLabel}>Avg Duration</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {workoutStats?.totalVolume || 0}kg
                  </span>
                  <span className={styles.statLabel}>Total Volume</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {workoutStats?.consistency || 0}%
                  </span>
                  <span className={styles.statLabel}>Consistency</span>
                </div>
              </div>
            </Card>
          </div>
        );
        
      case 'exercises':
        return (
          <div className={styles.exerciseView}>
            <Card className={styles.exerciseProgress}>
              <h3>Exercise Progress</h3>
              <p>Coming soon - Track progress for individual exercises</p>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Progress Tracking</h1>
          <p>Monitor your fitness journey and celebrate your achievements</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.timeRangeSelector}>
            <Button
              variant={timeRange === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'year' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <Button
          variant={activeView === 'overview' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeView === 'weight' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('weight')}
        >
          Weight
        </Button>
        <Button
          variant={activeView === 'workouts' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('workouts')}
        >
          Workouts
        </Button>
        <Button
          variant={activeView === 'exercises' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('exercises')}
        >
          Exercises
        </Button>
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ProgressTracking;