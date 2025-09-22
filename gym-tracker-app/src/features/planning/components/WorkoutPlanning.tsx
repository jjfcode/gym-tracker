import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner/LoadingSpinner';
import { WeeklyCalendar } from './WeeklyCalendar';
import { MonthlyCalendar } from './MonthlyCalendar';
import { WorkoutScheduler } from './WorkoutScheduler';
import { useAuth } from '../../auth/AuthContext';
import { planningService } from '../../../lib/planning-service';
import styles from './WorkoutPlanning.module.css';

type PlanningView = 'week' | 'month' | 'schedule';

const WorkoutPlanning: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<PlanningView>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get workout schedule
  const { data: workoutSchedule, isLoading } = useQuery({
    queryKey: ['workoutSchedule', user?.id],
    queryFn: () => planningService.getWorkoutSchedule(user!.id),
    enabled: !!user?.id,
  });

  // Get planned workouts for current period
  const { data: plannedWorkouts } = useQuery({
    queryKey: ['plannedWorkouts', user?.id, selectedDate],
    queryFn: () => planningService.getPlannedWorkouts(user!.id, selectedDate),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'week':
        return (
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            workouts={plannedWorkouts}
            onWorkoutClick={(workout) => console.log('Workout clicked:', workout)}
          />
        );
        
      case 'month':
        return (
          <MonthlyCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            workouts={plannedWorkouts}
            onWorkoutClick={(workout) => console.log('Workout clicked:', workout)}
          />
        );
        
      case 'schedule':
        return (
          <WorkoutScheduler
            schedule={workoutSchedule}
            onScheduleUpdate={(newSchedule) => console.log('Schedule updated:', newSchedule)}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Workout Planning</h1>
          <p>Plan and schedule your workouts for optimal results</p>
        </div>
        
        <div className={styles.actions}>
          <Button variant="primary">
            Add Workout
          </Button>
        </div>
      </div>

      <div className={styles.navigation}>
        <Button
          variant={activeView === 'week' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('week')}
        >
          Week View
        </Button>
        <Button
          variant={activeView === 'month' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('month')}
        >
          Month View
        </Button>
        <Button
          variant={activeView === 'schedule' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('schedule')}
        >
          Schedule
        </Button>
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <Card className={styles.statCard}>
          <h3>This Week</h3>
          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {plannedWorkouts?.thisWeek?.planned || 0}
              </span>
              <span className={styles.statLabel}>Planned</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {plannedWorkouts?.thisWeek?.completed || 0}
              </span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {plannedWorkouts?.thisWeek?.remaining || 0}
              </span>
              <span className={styles.statLabel}>Remaining</span>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <h3>This Month</h3>
          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {plannedWorkouts?.thisMonth?.planned || 0}
              </span>
              <span className={styles.statLabel}>Planned</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {plannedWorkouts?.thisMonth?.completed || 0}
              </span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {Math.round((plannedWorkouts?.thisMonth?.completed || 0) / (plannedWorkouts?.thisMonth?.planned || 1) * 100)}%
              </span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutPlanning;