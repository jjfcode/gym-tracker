import React, { useEffect } from 'react';
import { useWorkoutPreview } from '../../hooks/useCalendarData';
import type { WorkoutPreviewData } from '../../types';
import styles from './WorkoutPreviewModal.module.css';

interface WorkoutPreviewModalProps {
  workoutId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout?: (workoutId: number) => void;
  onReschedule?: (workoutId: number) => void;
  onDelete?: (workoutId: number) => void;
}

const WorkoutPreviewModal: React.FC<WorkoutPreviewModalProps> = ({
  workoutId,
  isOpen,
  onClose,
  onStartWorkout,
  onReschedule,
  onDelete,
}) => {
  const { data: workout, isLoading, error } = useWorkoutPreview(workoutId);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateProgress = (completedSets: number, targetSets: number) => {
    return targetSets > 0 ? (completedSets / targetSets) * 100 : 0;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loading}>
          <div>Loading workout details...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.error}>
          <div>Error loading workout details</div>
          <button className={styles.actionButton} onClick={onClose}>
            Close
          </button>
        </div>
      );
    }

    if (!workout) {
      return (
        <div className={styles.emptyState}>
          <div>No workout data available</div>
          <button className={styles.actionButton} onClick={onClose}>
            Close
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.content}>
          {/* Workout Information */}
          <div className={styles.workoutInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date</span>
              <span className={styles.infoValue}>{formatDate(workout.date)}</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={`${styles.statusBadge} ${workout.is_completed ? styles.completed : styles.scheduled}`}>
                {workout.is_completed ? 'Completed' : 'Scheduled'}
              </span>
            </div>
            
            {workout.duration_minutes && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Duration</span>
                <span className={styles.infoValue}>{workout.duration_minutes} minutes</span>
              </div>
            )}
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Exercises</span>
              <span className={styles.infoValue}>{workout.exercises.length} exercises</span>
            </div>
          </div>

          {/* Exercises */}
          <div className={styles.exercisesSection}>
            <h3 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6.5 6.5 11 11"></path>
                <path d="m21 21-1-1"></path>
                <path d="m3 3 1 1"></path>
                <path d="m18 22 4-4"></path>
                <path d="m2 6 4-4"></path>
                <path d="m3 10 7-7"></path>
                <path d="m14 21 7-7"></path>
              </svg>
              Exercises
            </h3>
            
            <div className={styles.exerciseList}>
              {workout.exercises.map((exercise) => {
                const progress = calculateProgress(exercise.completed_sets || 0, exercise.target_sets);
                
                return (
                  <div key={exercise.id} className={styles.exerciseItem}>
                    <div>
                      <div className={styles.exerciseName}>{exercise.name_en}</div>
                      <div className={styles.exerciseDetails}>
                        <span>{exercise.target_sets} sets × {exercise.target_reps} reps</span>
                        {exercise.completed_sets !== undefined && (
                          <span>({exercise.completed_sets} completed)</span>
                        )}
                      </div>
                    </div>
                    
                    {exercise.completed_sets !== undefined && (
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {workout.notes && (
            <div className={styles.notesSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Notes
              </h3>
              <div className={styles.notes}>{workout.notes}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!workout.is_completed && onStartWorkout && (
            <button
              className={`${styles.actionButton} ${styles.primary}`}
              onClick={() => onStartWorkout(workout.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
              Start Workout
            </button>
          )}
          
          {onReschedule && (
            <button
              className={styles.actionButton}
              onClick={() => onReschedule(workout.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              Reschedule
            </button>
          )}
          
          {onDelete && (
            <button
              className={`${styles.actionButton} ${styles.danger}`}
              onClick={() => onDelete(workout.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0,0,1-2,2H7a2,2 0,0,1-2-2V6m3,0V4a2,2 0,0,1,2-2h4a2,2 0,0,1,2,2v2"></path>
              </svg>
              Delete
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {workout?.title || 'Workout Details'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default WorkoutPreviewModal;