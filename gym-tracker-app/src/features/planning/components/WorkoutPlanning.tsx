import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner/LoadingSpinner';
import WeeklyCalendar from './WeeklyCalendar/WeeklyCalendar';
import MonthlyCalendar from './MonthlyCalendar/MonthlyCalendar';
import { WorkoutScheduler } from './WorkoutScheduler';
import { useAuth } from '../../auth/AuthContext';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';
import { planningService } from '../../../lib/planning-service';
import { createWorkoutForDate } from '../services/calendarService';
import type { WorkoutSummary } from '../types';
import styles from './WorkoutPlanning.module.css';

type PlanningView = 'week' | 'month' | 'schedule';

const WorkoutPlanning: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<PlanningView>('week');
  const queryClient = useQueryClient();
  
  // Calendar navigation
  const navigation = useCalendarNavigation(new Date(), activeView === 'week' ? 'week' : 'month');

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (date: string) => {
      return createWorkoutForDate(date, 'New Workout');
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['plannedWorkouts'] });
      queryClient.invalidateQueries({ queryKey: ['workoutSchedule'] });
    },
  });

  // Handle creating a new workout
  const handleAddWorkout = async () => {
    const today = new Date().toISOString().split('T')[0] as string;
    try {
      const workoutId = await createWorkoutMutation.mutateAsync(today);
      console.log('Workout created with ID:', workoutId);
      // Could add success notification here
    } catch (error) {
      console.error('Failed to create workout:', error);
      // Could add error notification here
    }
  };

  // Get workout schedule for the schedule view only
  const { data: workoutSchedule, isLoading } = useQuery({
    queryKey: ['workoutSchedule', user?.id],
    queryFn: () => planningService.getWorkoutSchedule(user!.id),
    enabled: !!user?.id && activeView === 'schedule',
  });

  // Handle day clicks from calendar
  const handleDayClick = (date: string, workout?: WorkoutSummary) => {
    console.log('Day clicked:', date, workout);
    // Could navigate to workout detail or create new workout
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: 'week' | 'month') => {
    navigation.setViewMode(mode);
    setActiveView(mode);
  };

  if (isLoading && activeView === 'schedule') {
    return <LoadingSpinner />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'week':
        return (
          <WeeklyCalendar
            navigation={navigation}
            onDayClick={handleDayClick}
            onViewModeChange={handleViewModeChange}
          />
        );
        
      case 'month':
        return (
          <MonthlyCalendar
            navigation={navigation}
            onDayClick={handleDayClick}
            onViewModeChange={handleViewModeChange}
          />
        );
        
      case 'schedule':
        return (
          <WorkoutScheduler
            schedule={workoutSchedule || []}
            onScheduleUpdate={(newSchedule) => console.log('Schedule updated:', newSchedule)}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <div className={styles['titleSection']}>
          <h1>Workout Planning</h1>
          <p>Plan and schedule your workouts for optimal results</p>
        </div>
        
        <div className={styles['actions']}>
          <Button 
            variant="primary"
            onClick={handleAddWorkout}
            disabled={createWorkoutMutation.isPending}
          >
            {createWorkoutMutation.isPending ? 'Creating...' : 'Add Workout'}
          </Button>
        </div>
      </div>

      <div className={styles['navigation']}>
        <Button
          variant={activeView === 'week' ? 'primary' : 'ghost'}
          onClick={() => {
            setActiveView('week');
            navigation.setViewMode('week');
          }}
        >
          Week View
        </Button>
        <Button
          variant={activeView === 'month' ? 'primary' : 'ghost'}
          onClick={() => {
            setActiveView('month');
            navigation.setViewMode('month');
          }}
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

      <div className={styles['content']}>
        {renderContent()}
      </div>
    </div>
  );
};

export default WorkoutPlanning;