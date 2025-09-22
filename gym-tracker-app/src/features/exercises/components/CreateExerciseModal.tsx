import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { useAuth } from '../../auth/AuthContext';
import { exerciseService } from '../../../lib/exercise-service';
import styles from './CreateExerciseModal.module.css';

interface CreateExerciseModalProps {
  onClose: () => void;
  categories?: string[];
  muscleGroups?: string[];
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  onClose,
  categories = [],
  muscleGroups = []
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    primary_muscles: [] as string[],
    secondary_muscles: [] as string[],
    equipment: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    instructions: ['']
  });

  const createExerciseMutation = useMutation({
    mutationFn: () => exerciseService.createExercise(user!.id, {
      ...formData,
      is_public: false,
      instructions: formData.instructions.filter(instruction => instruction.trim() !== '')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      onClose();
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMuscleToggle = (muscle: string, isPrimary: boolean) => {
    const field = isPrimary ? 'primary_muscles' : 'secondary_muscles';
    const currentMuscles = formData[field];
    
    if (currentMuscles.includes(muscle)) {
      handleInputChange(field, currentMuscles.filter(m => m !== muscle));
    } else {
      handleInputChange(field, [...currentMuscles, muscle]);
    }
  };

  const addInstruction = () => {
    handleInputChange('instructions', [...formData.instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    handleInputChange('instructions', newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      handleInputChange('instructions', newInstructions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category && formData.primary_muscles.length > 0) {
      createExerciseMutation.mutate();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <Card className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Create Custom Exercise</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Exercise Name *</label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter exercise name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the exercise"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="equipment">Equipment</label>
              <Input
                id="equipment"
                type="text"
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                placeholder="e.g., Barbell, Dumbbell"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Difficulty</label>
            <div className={styles.difficultyButtons}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <Button
                  key={level}
                  type="button"
                  variant={formData.difficulty === level ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('difficulty', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Primary Muscles *</label>
            <div className={styles.muscleGrid}>
              {muscleGroups.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  className={`${styles.muscleButton} ${
                    formData.primary_muscles.includes(muscle) ? styles.selected : ''
                  }`}
                  onClick={() => handleMuscleToggle(muscle, true)}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Secondary Muscles</label>
            <div className={styles.muscleGrid}>
              {muscleGroups.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  className={`${styles.muscleButton} ${
                    formData.secondary_muscles.includes(muscle) ? styles.selected : ''
                  }`}
                  onClick={() => handleMuscleToggle(muscle, false)}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Instructions</label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className={styles.instructionRow}>
                <Input
                  type="text"
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                {formData.instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
            >
              Add Step
            </Button>
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                !formData.name || 
                !formData.category || 
                formData.primary_muscles.length === 0 ||
                createExerciseMutation.isPending
              }
            >
              {createExerciseMutation.isPending ? 'Creating...' : 'Create Exercise'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};