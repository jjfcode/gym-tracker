import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui';
import SetInput from './SetInput';
import PreviousPerformance from './PreviousPerformance';
import { useExerciseSets } from '../hooks/useExerciseSets';
import { useUpdateExerciseSet } from '../hooks/useUpdateExerciseSet';
import { useAppStore } from '../../../store';
import type { Database } from '../../../types/database';
import styles from './ExerciseCard.module.css';

type Exercise = Database['public']['Tables']['exercises']['Row'] & {
  sets?: Database['public']['Tables']['exercise_sets']['Row'][];
};

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  workoutId: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  workoutId,
}) => {
  const { units } = useAppStore();
  const [showPrevious, setShowPrevious] = useState(false);
  
  const { data: sets = [], isLoading } = useExerciseSets(exercise.id);
  const updateSetMutation = useUpdateExerciseSet();

  const handleSetUpdate = async (updates: Partial<Database['public']['Tables']['exercise_sets']['Row']>) => {
    const setIndex = updates.set_index!;
    const existingSet = sets.find(set => set.set_index === setIndex);
    
    try {
      if (existingSet) {
        await updateSetMutation.mutateAsync({
          setId: existingSet.id,
          updates,
          optimistic: true,
        });
      } else {
        // Create new set
        await updateSetMutation.mutateAsync({
          exerciseId: exercise.id,
          setIndex,
          updates,
          optimistic: true,
        });
      }
    } catch (error) {
      console.error('Failed to update set:', error);
    }
  };

  const completedSets = sets.filter(set => set.weight && set.reps).length;
  const targetSets = exercise.target_sets;
  const isCompleted = completedSets >= targetSets;

  if (isLoading) {
    return (
      <Card className={styles.exerciseCard}>
        <div className={styles.loading}>Loading exercise...</div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.exerciseCard} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.exerciseInfo}>
          <h4 className={styles.exerciseName}>
            {exercise.name_en}
            {exercise.machine_brand && (
              <span className={styles.machineBrand}>({exercise.machine_brand})</span>
            )}
          </h4>
          <div className={styles.targetInfo}>
            {exercise.target_sets} sets × {exercise.target_reps} reps
          </div>
          <div className={styles.progress}>
            {completedSets} of {targetSets} sets completed
            {isCompleted && <span className={styles.completedIcon}>✓</span>}
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrevious(!showPrevious)}
          >
            {showPrevious ? 'Hide' : 'Previous'}
          </Button>
        </div>
      </div>

      {showPrevious && (
        <div className={styles.previousPerformance}>
          <PreviousPerformance exerciseSlug={exercise.slug} />
        </div>
      )}

      <div className={styles.sets}>
        {Array.from({ length: targetSets }, (_, index) => {
          const setIndex = index + 1;
          const existingSet = sets.find(set => set.set_index === setIndex);
          
          return (
            <SetInput
              key={setIndex}
              setIndex={setIndex}
              exerciseId={exercise.id}
              initialData={existingSet}
              onUpdate={handleSetUpdate}
              units={units}
              targetReps={exercise.target_reps}
              isLoading={updateSetMutation.isLoading}
              autoSave={true}
              autoSaveDelay={1000}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default ExerciseCard;