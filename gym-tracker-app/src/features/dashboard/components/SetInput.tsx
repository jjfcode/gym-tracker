import React, { useState, useEffect } from 'react';
import { Input, Button } from '../../../components/ui';
import type { Database } from '../../../types/database';
import type { Units } from '../../../store/appStore';
import styles from './SetInput.module.css';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

interface SetInputProps {
  setIndex: number;
  exerciseId: number;
  initialData?: ExerciseSet | null;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  units: Units;
  targetReps: number;
  isLoading?: boolean;
}

const SetInput: React.FC<SetInputProps> = ({
  setIndex,
  exerciseId,
  initialData,
  onUpdate,
  units,
  targetReps,
  isLoading = false,
}) => {
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [reps, setReps] = useState(initialData?.reps?.toString() || '');
  const [rpe, setRpe] = useState(initialData?.rpe?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasData = weight || reps || rpe || notes;
    const hasInitialData = initialData?.weight || initialData?.reps || initialData?.rpe || initialData?.notes;
    
    if (hasData && !hasInitialData) {
      setHasChanges(true);
    } else if (hasInitialData) {
      const weightChanged = weight !== (initialData?.weight?.toString() || '');
      const repsChanged = reps !== (initialData?.reps?.toString() || '');
      const rpeChanged = rpe !== (initialData?.rpe?.toString() || '');
      const notesChanged = notes !== (initialData?.notes || '');
      
      setHasChanges(weightChanged || repsChanged || rpeChanged || notesChanged);
    } else {
      setHasChanges(false);
    }
  }, [weight, reps, rpe, notes, initialData]);

  const handleSave = () => {
    const updates: Partial<ExerciseSet> = {
      exercise_id: exerciseId,
      set_index: setIndex,
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps, 10) : null,
      rpe: rpe ? parseFloat(rpe) : null,
      notes: notes || null,
    };

    onUpdate(updates);
    setHasChanges(false);
  };

  const handleQuickComplete = () => {
    if (initialData?.weight && !weight) {
      setWeight(initialData.weight.toString());
    }
    if (!reps) {
      setReps(targetReps.toString());
    }
    
    // Auto-save after setting values
    setTimeout(() => {
      const updates: Partial<ExerciseSet> = {
        exercise_id: exerciseId,
        set_index: setIndex,
        weight: weight || initialData?.weight || null,
        reps: reps || targetReps,
        rpe: rpe ? parseFloat(rpe) : null,
        notes: notes || null,
      };
      onUpdate(updates);
      setHasChanges(false);
    }, 100);
  };

  const isCompleted = (weight && reps) || (initialData?.weight && initialData?.reps);
  const weightUnit = units === 'metric' ? 'kg' : 'lbs';

  return (
    <div className={`${styles.setInput} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.setLabel}>
        Set {setIndex}
        {isCompleted && <span className={styles.completedIcon}>✓</span>}
      </div>
      
      <div className={styles.inputs}>
        <Input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          size="sm"
          rightIcon={<span className={styles.unit}>{weightUnit}</span>}
          className={styles.weightInput}
        />
        
        <Input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          size="sm"
          className={styles.repsInput}
        />
        
        <Input
          type="number"
          placeholder="RPE"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          size="sm"
          min="1"
          max="10"
          step="0.5"
          className={styles.rpeInput}
        />
      </div>

      <div className={styles.actions}>
        {hasChanges && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={isLoading}
            className={styles.saveButton}
          >
            Save
          </Button>
        )}
        
        {!isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickComplete}
            className={styles.quickButton}
          >
            Quick Complete
          </Button>
        )}
      </div>

      {notes && (
        <div className={styles.notes}>
          <Input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="sm"
            className={styles.notesInput}
          />
        </div>
      )}
    </div>
  );
};

export default SetInput;