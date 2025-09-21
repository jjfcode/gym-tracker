import React, { useState } from 'react';
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation';
import { useCreateWorkout, useRescheduleWorkout, useDeleteWorkout } from '../../hooks/useCalendarData';
import WeeklyCalendar from '../WeeklyCalendar/WeeklyCalendar';
import MonthlyCalendar from '../MonthlyCalendar/MonthlyCalendar';
import WorkoutPreviewModal from '../WorkoutPreviewModal/WorkoutPreviewModal';
import type { WorkoutSummary } from '../../types';
import styles from './PlanningView.module.css';

interface PlanningViewProps {
  initialViewMode?: 'week' | 'month';
  onNavigateToWorkout?: (workoutId: number) => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({
  initialViewMode = 'week',
  onNavigateToWorkout,
}) => {
  const navigation = useCalendarNavigation(new Date(), initialViewMode);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Mutations
  const createWorkoutMutation = useCreateWorkout();
  const rescheduleWorkoutMutation = useRescheduleWorkout();
  const deleteWorkoutMutation = useDeleteWorkout();

  const handleDayClick = (date: string, workout?: WorkoutSummary) => {
    if (workout) {
      setSelectedWorkoutId(workout.id);
      setIsPreviewModalOpen(true);
    } else {
      // Handle creating new workout for empty day
      handleCreateWorkout(date);
    }
  };

  const handleCreateWorkout = async (date: string) => {
    try {
      const workoutId = await createWorkoutMutation.mutateAsync({
        date,
        title: 'New Workout',
        exercises: [], // Empty workout for now
      });
      
      // Navigate to workout or show success message
      if (onNavigateToWorkout) {
        onNavigateToWorkout(workoutId);
      }
    } catch (error) {
      console.error('Failed to create workout:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleStartWorkout = (workoutId: number) => {
    setIsPreviewModalOpen(false);
    if (onNavigateToWorkout) {
      onNavigateToWorkout(workoutId);
    }
  };

  const handleRescheduleWorkout = async (workoutId: number) => {
    // For now, just close the modal
    // In a real implementation, you'd show a date picker modal
    setIsPreviewModalOpen(false);
    
    // Example reschedule logic (would need proper date picker)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toDate = tomorrow.toISOString().split('T')[0];
    
    try {
      await rescheduleWorkoutMutation.mutateAsync({
        workout_id: workoutId,
        from_date: new Date().toISOString().split('T')[0],
        to_date: toDate,
        reason: 'Rescheduled from calendar',
      });
    } catch (error) {
      console.error('Failed to reschedule workout:', error);
    }
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkoutMutation.mutateAsync(workoutId);
        setIsPreviewModalOpen(false);
      } catch (error) {
        console.error('Failed to delete workout:', error);
      }
    }
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedWorkoutId(null);
  };

  const handleViewModeChange = (mode: 'week' | 'month') => {
    navigation.setViewMode(mode);
  };

  const handleQuickCreateWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    handleCreateWorkout(today);
  };

  const renderCalendar = () => {
    if (navigation.viewMode === 'week') {
      return (
        <WeeklyCalendar
          navigation={navigation}
          onDayClick={handleDayClick}
          onViewModeChange={handleViewModeChange}
        />
      );
    } else {
      return (
        <MonthlyCalendar
          navigation={navigation}
          onDayClick={handleDayClick}
          onViewModeChange={handleViewModeChange}
        />
      );
    }
  };

  return (
    <div className={styles.planningView}>
      <div className={styles.header}>
        <h1 className={styles.title}>Workout Planning</h1>
        <p className={styles.subtitle}>
          Plan and track your workout schedule. Click on any day to view or create workouts.
        </p>
        
        <div className={styles.quickActions}>
          <button
            className={`${styles.quickActionButton} ${styles.primary}`}
            onClick={handleQuickCreateWorkout}
            disabled={createWorkoutMutation.isPending}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {createWorkoutMutation.isPending ? 'Creating...' : 'Quick Add Workout'}
          </button>
          
          <button
            className={styles.quickActionButton}
            onClick={navigation.goToToday}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            Go to Today
          </button>
        </div>
      </div>

      <div className={styles.calendarContainer}>
        {renderCalendar()}
      </div>

      <WorkoutPreviewModal
        workoutId={selectedWorkoutId}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        onStartWorkout={handleStartWorkout}
        onReschedule={handleRescheduleWorkout}
        onDelete={handleDeleteWorkout}
      />
    </div>
  );
};

export default PlanningView;