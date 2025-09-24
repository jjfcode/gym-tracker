import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button/Button';
import { Card } from '../../../components/ui/Card/Card';
import { Input } from '../../../components/ui/Input/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../auth';
import { workoutService } from '../../../lib/workout-service';
import type { Workout, WorkoutExercise, ExerciseSet } from '../../../types/workout';
import styles from './WorkoutTracker.module.css';

const WorkoutTracker: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);

  // Get today's workout or active workout
  const { data: todaysWorkout, isLoading } = useQuery({
    queryKey: ['todaysWorkout', user?.id],
    queryFn: () => workoutService.getTodaysWorkout(user!.id),
    enabled: !!user?.id,
  });

  // Get workout templates
  const { data: templates } = useQuery({
    queryKey: ['workoutTemplates', user?.id],
    queryFn: () => workoutService.getWorkoutTemplates(user!.id),
    enabled: !!user?.id,
  });

  // Start workout mutation
  const startWorkoutMutation = useMutation({
    mutationFn: (templateId?: string) => 
      workoutService.startWorkout(user!.id, templateId),
    onSuccess: (workout) => {
      setActiveWorkout(workout);
      queryClient.invalidateQueries({ queryKey: ['todaysWorkout'] });
    },
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: (workoutId: string) => 
      workoutService.completeWorkout(workoutId),
    onSuccess: () => {
      setActiveWorkout(null);
      queryClient.invalidateQueries({ queryKey: ['todaysWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
    },
  });

  // Update exercise set mutation
  const updateSetMutation = useMutation({
    mutationFn: ({ setId, data }: { setId: string; data: Partial<ExerciseSet> }) =>
      workoutService.updateExerciseSet(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysWorkout'] });
    },
  });

  useEffect(() => {
    if (todaysWorkout && todaysWorkout.status === 'in_progress') {
      setActiveWorkout(todaysWorkout);
    }
  }, [todaysWorkout]);

  const handleStartWorkout = async (templateId?: string) => {
    setIsStartingWorkout(true);
    try {
      await startWorkoutMutation.mutateAsync(templateId);
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (activeWorkout) {
      await completeWorkoutMutation.mutateAsync(activeWorkout.id);
    }
  };

  const handleUpdateSet = (setId: string, field: keyof ExerciseSet, value: number) => {
    updateSetMutation.mutate({
      setId,
      data: { [field]: value }
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // No active workout - show start options
  if (!activeWorkout) {
    return (
      <div className={styles['container']}>
        <div className={styles['header']}>
          <h1>Start Your Workout</h1>
          <p>Choose a template or start a custom workout</p>
        </div>

        <div className={styles['startOptions']}>
          <Card className={styles['quickStartCard']}>
            <h3>Quick Start</h3>
            <p>Start an empty workout and add exercises as you go</p>
            <Button
              onClick={() => handleStartWorkout()}
              disabled={isStartingWorkout}
              className={styles['startButton']}
            >
              {isStartingWorkout ? 'Starting...' : 'Start Empty Workout'}
            </Button>
          </Card>

          {templates && templates.length > 0 && (
            <div className={styles['templates']}>
              <h3>Workout Templates</h3>
              <div className={styles['templateGrid']}>
                {templates.map((template) => (
                  <Card key={template.id} className={styles['templateCard']}>
                    <h4>{template.name}</h4>
                    <p>{template.exercises?.length || 0} exercises</p>
                    <Button
                      onClick={() => handleStartWorkout(template.id)}
                      disabled={isStartingWorkout}
                      size="sm"
                    >
                      Use Template
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active workout - show tracking interface
  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <div className={styles['workoutInfo']}>
          <h1>{activeWorkout.name || 'Current Workout'}</h1>
          <p>Started at {new Date(activeWorkout.started_at!).toLocaleTimeString()}</p>
        </div>
        <Button
          onClick={handleCompleteWorkout}
          variant="primary"
          disabled={completeWorkoutMutation.isPending}
        >
          {completeWorkoutMutation.isPending ? 'Finishing...' : 'Finish Workout'}
        </Button>
      </div>

      <div className={styles['exercises']}>
        {activeWorkout.exercises?.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateSet={handleUpdateSet}
          />
        ))}

        {(!activeWorkout.exercises || activeWorkout.exercises.length === 0) && (
          <Card className={styles['emptyState']}>
            <h3>No exercises yet</h3>
            <p>Add exercises to start tracking your workout</p>
            <Button variant="outline">Add Exercise</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

// Exercise Card Component
interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: string, field: keyof ExerciseSet, value: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdateSet }) => {
  const [newSetData, setNewSetData] = useState({ reps: 0, weight: 0 });

  const addSet = () => {
    // This would call a mutation to add a new set
    console.log('Add set:', newSetData);
  };

  return (
    <Card className={styles['exerciseCard']}>
      <div className={styles['exerciseHeader']}>
        <h3>{exercise.exercise?.name}</h3>
        <span className={styles['setCount']}>
          {exercise.sets?.length || 0} sets
        </span>
      </div>

      <div className={styles['sets']}>
        {exercise.sets?.map((set, index) => (
          <div key={set.id} className={styles['setRow']}>
            <span className={styles['setNumber']}>{index + 1}</span>
            
            <div className={styles['setInputs']}>
              <Input
                type="number"
                placeholder="Weight"
                value={set.weight || ''}
                onChange={(e) => onUpdateSet(set.id, 'weight', Number(e.target.value))}
                className={styles['setInput']}
              />
              <span className={styles['inputLabel']}>kg</span>
              
              <Input
                type="number"
                placeholder="Reps"
                value={set.reps || ''}
                onChange={(e) => onUpdateSet(set.id, 'reps', Number(e.target.value))}
                className={styles['setInput']}
              />
              <span className={styles['inputLabel']}>reps</span>
              
              {set.rpe && (
                <>
                  <Input
                    type="number"
                    placeholder="RPE"
                    value={set.rpe || ''}
                    onChange={(e) => onUpdateSet(set.id, 'rpe', Number(e.target.value))}
                    className={styles['setInput']}
                    min="1"
                    max="10"
                  />
                  <span className={styles['inputLabel']}>RPE</span>
                </>
              )}
            </div>

            <div className={styles['setActions']}>
              <Button
                variant="ghost"
                size="sm"
                className={set.completed ? styles['completedSet'] : ''}
                onClick={() => onUpdateSet(set.id, 'completed', set.completed ? 0 : 1)}
              >
                {set.completed ? '✓' : '○'}
              </Button>
            </div>
          </div>
        ))}

        <div className={styles['addSetRow']}>
          <span className={styles['setNumber']}>+</span>
          <div className={styles['setInputs']}>
            <Input
              type="number"
              placeholder="Weight"
              value={newSetData.weight || ''}
              onChange={(e) => setNewSetData(prev => ({ ...prev, weight: Number(e.target.value) }))}
              className={styles['setInput']}
            />
            <span className={styles['inputLabel']}>kg</span>
            
            <Input
              type="number"
              placeholder="Reps"
              value={newSetData.reps || ''}
              onChange={(e) => setNewSetData(prev => ({ ...prev, reps: Number(e.target.value) }))}
              className={styles['setInput']}
            />
            <span className={styles['inputLabel']}>reps</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addSet}
            disabled={!newSetData.weight || !newSetData.reps}
          >
            Add Set
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutTracker;