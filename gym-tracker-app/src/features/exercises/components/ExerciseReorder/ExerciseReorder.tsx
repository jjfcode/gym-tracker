import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../../../components/ui';
import { useWorkoutExerciseModification } from '../../hooks/useCustomExercises';
import type { ExerciseReorderItem } from '../../types';
import styles from './ExerciseReorder.module.css';

interface ExerciseReorderProps {
  workoutId: number;
  exercises: ExerciseReorderItem[];
  onClose: () => void;
  locale?: 'en' | 'es';
}

const ExerciseReorder: React.FC<ExerciseReorderProps> = ({
  workoutId,
  exercises: initialExercises,
  onClose,
  locale = 'en',
}) => {
  const [exercises, setExercises] = useState<ExerciseReorderItem[]>(
    [...initialExercises].sort((a, b) => a.order_index - b.order_index)
  );
  const [hasChanges, setHasChanges] = useState(false);

  const { 
    reorderExercises, 
    updateExercise, 
    removeExercise,
    isReordering, 
    isUpdating, 
    isRemoving 
  } = useWorkoutExerciseModification(workoutId);

  useEffect(() => {
    const originalOrder = initialExercises
      .sort((a, b) => a.order_index - b.order_index)
      .map(ex => ex.id);
    const currentOrder = exercises.map(ex => ex.id);
    
    const orderChanged = !originalOrder.every((id, index) => id === currentOrder[index]);
    const valuesChanged = exercises.some(ex => {
      const original = initialExercises.find(orig => orig.id === ex.id);
      return original && (
        original.target_sets !== ex.target_sets ||
        original.target_reps !== ex.target_reps
      );
    });

    setHasChanges(orderChanged || valuesChanged);
  }, [exercises, initialExercises]);

  const moveExercise = (fromIndex: number, toIndex: number) => {
    const newExercises = [...exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    
    // Update order indices
    const updatedExercises = newExercises.map((exercise, index) => ({
      ...exercise,
      order_index: index,
    }));
    
    setExercises(updatedExercises);
  };

  const updateExerciseValues = (exerciseId: number, field: 'target_sets' | 'target_reps', value: number) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleRemoveExercise = (exerciseId: number) => {
    if (window.confirm('Are you sure you want to remove this exercise from the workout?')) {
      removeExercise(exerciseId);
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    }
  };

  const handleSaveChanges = () => {
    // Save reorder changes
    const reorderData = exercises.map((exercise, index) => ({
      id: exercise.id,
      order_index: index,
    }));
    
    reorderExercises(reorderData);

    // Save value changes
    exercises.forEach(exercise => {
      const original = initialExercises.find(orig => orig.id === exercise.id);
      if (original && (
        original.target_sets !== exercise.target_sets ||
        original.target_reps !== exercise.target_reps
      )) {
        updateExercise({
          exerciseId: exercise.id,
          updates: {
            target_sets: exercise.target_sets,
            target_reps: exercise.target_reps,
          },
        });
      }
    });

    onClose();
  };

  const isLoading = isReordering || isUpdating || isRemoving;

  return (
    <div className={styles.exerciseReorder}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reorder & Modify Exercises</h2>
        <p className={styles.subtitle}>
          Drag exercises to reorder them, or modify sets and reps
        </p>
      </div>

      <div className={styles.exerciseList}>
        {exercises.map((exercise, index) => (
          <Card key={exercise.id} className={styles.exerciseItem}>
            <div className={styles.dragHandle}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 6h10v1H3V6zm0 3h10v1H3V9z"/>
              </svg>
            </div>

            <div className={styles.exerciseInfo}>
              <h3 className={styles.exerciseName}>{exercise.name}</h3>
              <div className={styles.exerciseControls}>
                <div className={styles.controlGroup}>
                  <label>Sets:</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={exercise.target_sets}
                    onChange={(e) => updateExerciseValues(
                      exercise.id, 
                      'target_sets', 
                      parseInt(e.target.value) || 1
                    )}
                    className={styles.numberInput}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label>Reps:</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={exercise.target_reps}
                    onChange={(e) => updateExerciseValues(
                      exercise.id, 
                      'target_reps', 
                      parseInt(e.target.value) || 1
                    )}
                    className={styles.numberInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.exerciseActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveExercise(index, Math.max(0, index - 1))}
                disabled={index === 0}
                className={styles.moveButton}
              >
                ↑
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveExercise(index, Math.min(exercises.length - 1, index + 1))}
                disabled={index === exercises.length - 1}
                className={styles.moveButton}
              >
                ↓
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExercise(exercise.id)}
                className={styles.removeButton}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className={styles.emptyState}>
          <p>No exercises in this workout.</p>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSaveChanges}
          disabled={!hasChanges || isLoading}
          loading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ExerciseReorder;