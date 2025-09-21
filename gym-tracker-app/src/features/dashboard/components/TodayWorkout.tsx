import React from 'react';
import { Card, Button } from '../../../components/ui';
import ExerciseCard from './ExerciseCard';
import WorkoutTimer from './WorkoutTimer';
import { useTodayWorkout } from '../hooks/useTodayWorkout';
import { useCompleteWorkout } from '../hooks/useCompleteWorkout';
import { useUpdateWorkoutCompletion } from '../hooks/useWorkoutHistory';
import styles from './TodayWorkout.module.css';

const TodayWorkout: React.FC = () => {
  const { data: workout, isLoading, error } = useTodayWorkout();
  const completeWorkoutMutation = useCompleteWorkout();
  const updateWorkoutCompletion = useUpdateWorkoutCompletion();

  const handleCompleteWorkout = () => {
    if (workout && !workout.is_completed) {
      completeWorkoutMutation.mutate(workout.id);
    }
  };

  const handleTimerComplete = (elapsedTime: number) => {
    if (workout && !workout.is_completed) {
      const durationMinutes = Math.round(elapsedTime / 60);
      updateWorkoutCompletion.mutate({
        workoutId: workout.id,
        isCompleted: true,
        durationMinutes,
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={styles.todayWorkout}>
        <div className={styles.loading}>Loading today's workout...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.todayWorkout}>
        <div className={styles.error}>
          <h3>Unable to load workout</h3>
          <p>Please check your connection and try again.</p>
        </div>
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card className={styles.todayWorkout}>
        <div className={styles.restDay}>
          <h3>Rest Day</h3>
          <p>No workout scheduled for today. Take some time to recover!</p>
        </div>
      </Card>
    );
  }

  const completedExercises = workout.exercises?.filter(ex => 
    ex.sets?.every(set => set.weight && set.reps)
  ).length || 0;
  
  const totalExercises = workout.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <Card className={styles.todayWorkout}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{workout.title}</h3>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {completedExercises} of {totalExercises} exercises completed
            </span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {workout.is_completed ? (
          <div className={styles.completedBadge}>
            ✓ Completed
            {workout.duration_minutes && (
              <span className={styles.duration}>
                ({workout.duration_minutes} min)
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCompleteWorkout}
            loading={completeWorkoutMutation.isLoading || updateWorkoutCompletion.isLoading}
            disabled={progressPercentage < 100}
          >
            Complete Workout
          </Button>
        )}
      </div>

      {!workout.is_completed && (
        <div className={styles.timerSection}>
          <WorkoutTimer
            workoutId={workout.id}
            onComplete={handleTimerComplete}
            className={styles.workoutTimer}
          />
        </div>
      )}

      <div className={styles.exercises}>
        {workout.exercises?.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={index}
            workoutId={workout.id}
          />
        ))}
      </div>

      {workout.notes && (
        <div className={styles.notes}>
          <h4>Notes</h4>
          <p>{workout.notes}</p>
        </div>
      )}
    </Card>
  );
};

export default TodayWorkout;