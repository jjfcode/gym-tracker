import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button } from '../../../components/ui';
import { validateSetInput } from '../../../lib/validations/workout';
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
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const SetInput: React.FC<SetInputProps> = ({
  setIndex,
  exerciseId,
  initialData,
  onUpdate,
  units,
  targetReps,
  isLoading = false,
  autoSave = true,
  autoSaveDelay = 1000,
}) => {
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [reps, setReps] = useState(initialData?.reps?.toString() || '');
  const [rpe, setRpe] = useState(initialData?.rpe?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Update initial data when it changes
  useEffect(() => {
    if (initialData) {
      setWeight(initialData.weight?.toString() || '');
      setReps(initialData.reps?.toString() || '');
      setRpe(initialData.rpe?.toString() || '');
      setNotes(initialData.notes || '');
      
      // Update last saved data reference
      lastSavedDataRef.current = JSON.stringify({
        weight: initialData.weight?.toString() || '',
        reps: initialData.reps?.toString() || '',
        rpe: initialData.rpe?.toString() || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  // Validate input data
  const validateInputs = useCallback(() => {
    const validation = validateSetInput({
      weight,
      reps,
      rpe,
      notes,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  }, [weight, reps, rpe, notes]);

  // Check for changes
  useEffect(() => {
    const currentData = JSON.stringify({ weight, reps, rpe, notes });
    const hasDataChanged = currentData !== lastSavedDataRef.current;
    
    setHasChanges(hasDataChanged);
    
    // Validate inputs when they change
    validateInputs();
  }, [weight, reps, rpe, notes, validateInputs]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && Object.keys(validationErrors).length === 0) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, validationErrors, autoSave, autoSaveDelay]);

  const handleSave = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);

    const updates: Partial<ExerciseSet> = {
      exercise_id: exerciseId,
      set_index: setIndex,
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps, 10) : null,
      rpe: rpe ? parseFloat(rpe) : null,
      notes: notes || null,
    };

    try {
      await onUpdate(updates);
      
      // Update last saved data reference
      lastSavedDataRef.current = JSON.stringify({ weight, reps, rpe, notes });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save set data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [exerciseId, setIndex, weight, reps, rpe, notes, onUpdate, validateInputs]);

  const handleQuickComplete = useCallback(() => {
    // Use previous weight if available and current weight is empty
    if (initialData?.weight && !weight) {
      setWeight(initialData.weight.toString());
    }
    
    // Use target reps if current reps is empty
    if (!reps) {
      setReps(targetReps.toString());
    }
    
    // Trigger immediate save after a short delay to allow state updates
    setTimeout(() => {
      handleSave();
    }, 100);
  }, [initialData?.weight, weight, reps, targetReps, handleSave]);

  const handleInputChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'weight':
        setWeight(value);
        break;
      case 'reps':
        setReps(value);
        break;
      case 'rpe':
        setRpe(value);
        break;
      case 'notes':
        setNotes(value);
        break;
    }
  }, []);

  const isCompleted = (weight && reps) || (initialData?.weight && initialData?.reps);
  const weightUnit = units === 'metric' ? 'kg' : 'lbs';
  const showSaveButton = hasChanges && !autoSave;
  const showAutoSaveIndicator = autoSave && (hasChanges || isSaving);

  return (
    <div className={`${styles.setInput} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.setLabel}>
        <span>Set {setIndex}</span>
        {isCompleted && <span className={styles.completedIcon}>✓</span>}
        {showAutoSaveIndicator && (
          <span className={`${styles.autoSaveIndicator} ${isSaving ? styles.saving : ''}`}>
            {isSaving ? 'Saving...' : 'Auto-save'}
          </span>
        )}
      </div>
      
      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <Input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            size="sm"
            rightIcon={<span className={styles.unit}>{weightUnit}</span>}
            className={`${styles.weightInput} ${validationErrors.weight ? styles.error : ''}`}
            min="0"
            step="0.5"
          />
          {validationErrors.weight && (
            <span className={styles.errorText}>{validationErrors.weight}</span>
          )}
        </div>
        
        <div className={styles.inputGroup}>
          <Input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => handleInputChange('reps', e.target.value)}
            size="sm"
            className={`${styles.repsInput} ${validationErrors.reps ? styles.error : ''}`}
            min="1"
            max="100"
          />
          {validationErrors.reps && (
            <span className={styles.errorText}>{validationErrors.reps}</span>
          )}
        </div>
        
        <div className={styles.inputGroup}>
          <Input
            type="number"
            placeholder="RPE"
            value={rpe}
            onChange={(e) => handleInputChange('rpe', e.target.value)}
            size="sm"
            min="1"
            max="10"
            step="0.5"
            className={`${styles.rpeInput} ${validationErrors.rpe ? styles.error : ''}`}
          />
          {validationErrors.rpe && (
            <span className={styles.errorText}>{validationErrors.rpe}</span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {showSaveButton && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={isLoading || isSaving}
            disabled={Object.keys(validationErrors).length > 0}
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
            disabled={isLoading || isSaving}
            className={styles.quickButton}
          >
            Quick Complete
          </Button>
        )}
      </div>

      <div className={styles.notesSection}>
        <Input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          size="sm"
          className={`${styles.notesInput} ${validationErrors.notes ? styles.error : ''}`}
          maxLength={500}
        />
        {validationErrors.notes && (
          <span className={styles.errorText}>{validationErrors.notes}</span>
        )}
      </div>
    </div>
  );
};

export default SetInput;