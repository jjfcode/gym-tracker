import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input, Textarea, Select } from '../../../../components/ui';
import { customExerciseSchema, type CustomExerciseFormData } from '../../../../lib/validations/exercise';
import { ExerciseService } from '../../services/exerciseService';
import { useAuth } from '../../../auth/AuthContext';
import type { CustomExercise } from '../../types';
import type { MuscleGroup, Equipment } from '../../../../types/workout';
import styles from './CustomExerciseForm.module.css';

interface CustomExerciseFormProps {
  exercise?: CustomExercise;
  onSubmit: (exercise: CustomExerciseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CustomExerciseForm: React.FC<CustomExerciseFormProps> = ({
  exercise,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [slugError, setSlugError] = useState<string>('');
  const isEditing = !!exercise;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CustomExerciseFormData>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: exercise ? {
      slug: exercise.slug,
      name_en: exercise.name_en,
      name_es: exercise.name_es,
      muscle_groups: exercise.muscle_groups,
      equipment: exercise.equipment,
      instructions_en: exercise.instructions_en,
      instructions_es: exercise.instructions_es,
      difficulty_level: exercise.difficulty_level,
      is_compound: exercise.is_compound,
      variations: exercise.variations || [],
      media_url: exercise.media_url || '',
    } : {
      slug: '',
      name_en: '',
      name_es: '',
      muscle_groups: [],
      equipment: 'bodyweight' as Equipment,
      instructions_en: '',
      instructions_es: '',
      difficulty_level: 'beginner' as const,
      is_compound: false,
      variations: [],
      media_url: '',
    },
    mode: 'onChange',
  });

  const nameEn = watch('name_en');

  // Auto-generate slug from English name
  useEffect(() => {
    if (nameEn && !isEditing) {
      const generatedSlug = ExerciseService.generateSlug(nameEn);
      setValue('slug', generatedSlug);
      setSlugError('');
    }
  }, [nameEn, setValue, isEditing]);

  const validateSlug = async (slug: string) => {
    if (!user || !slug || isEditing) return;
    
    try {
      const isAvailable = await ExerciseService.validateExerciseSlug(slug, user.id);
      if (!isAvailable) {
        setSlugError('This slug is already in use. Please choose a different name.');
      } else {
        setSlugError('');
      }
    } catch (error) {
      console.error('Error validating slug:', error);
    }
  };

  const muscleGroupOptions = [
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'forearms', label: 'Forearms' },
    { value: 'abs', label: 'Abs' },
    { value: 'obliques', label: 'Obliques' },
    { value: 'quadriceps', label: 'Quadriceps' },
    { value: 'hamstrings', label: 'Hamstrings' },
    { value: 'glutes', label: 'Glutes' },
    { value: 'calves', label: 'Calves' },
    { value: 'traps', label: 'Traps' },
    { value: 'lats', label: 'Lats' },
    { value: 'rhomboids', label: 'Rhomboids' },
    { value: 'rear-delts', label: 'Rear Delts' },
  ];

  const equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'machine', label: 'Machine' },
    { value: 'cable', label: 'Cable' },
    { value: 'resistance-band', label: 'Resistance Band' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'smith-machine', label: 'Smith Machine' },
    { value: 'pull-up-bar', label: 'Pull-up Bar' },
    { value: 'bench', label: 'Bench' },
    { value: 'none', label: 'None' },
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleFormSubmit = (data: CustomExerciseFormData) => {
    if (slugError) return;
    onSubmit(data);
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isEditing ? 'Edit Custom Exercise' : 'Create Custom Exercise'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.nameSection}>
            <Controller
              name="name_en"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Exercise Name (English)"
                  placeholder="e.g., Push-ups"
                  error={errors.name_en?.message}
                  required
                />
              )}
            />

            <Controller
              name="name_es"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Exercise Name (Spanish)"
                  placeholder="e.g., Flexiones"
                  error={errors.name_es?.message}
                  required
                />
              )}
            />
          </div>

          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Slug"
                placeholder="auto-generated-from-name"
                error={errors.slug?.message || slugError}
                helperText="URL-friendly identifier (auto-generated)"
                onBlur={(e) => validateSlug(e.target.value)}
                disabled={isEditing}
              />
            )}
          />

          <Controller
            name="muscle_groups"
            control={control}
            render={({ field }) => (
              <div className={styles.selectField}>
                <label className={styles.label}>
                  Muscle Groups <span className={styles.required}>*</span>
                </label>
                <Select
                  options={muscleGroupOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select muscle groups"
                  multiple
                  searchable
                />
                {errors.muscle_groups && (
                  <div className={styles.error}>{errors.muscle_groups.message}</div>
                )}
              </div>
            )}
          />

          <Controller
            name="equipment"
            control={control}
            render={({ field }) => (
              <div className={styles.selectField}>
                <label className={styles.label}>
                  Equipment <span className={styles.required}>*</span>
                </label>
                <Select
                  options={equipmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select equipment"
                />
                {errors.equipment && (
                  <div className={styles.error}>{errors.equipment.message}</div>
                )}
              </div>
            )}
          />

          <Controller
            name="difficulty_level"
            control={control}
            render={({ field }) => (
              <div className={styles.selectField}>
                <label className={styles.label}>
                  Difficulty Level <span className={styles.required}>*</span>
                </label>
                <Select
                  options={difficultyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select difficulty"
                />
                {errors.difficulty_level && (
                  <div className={styles.error}>{errors.difficulty_level.message}</div>
                )}
              </div>
            )}
          />

          <div className={styles.checkboxField}>
            <Controller
              name="is_compound"
              control={control}
              render={({ field }) => (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className={styles.checkbox}
                  />
                  Compound Exercise
                  <span className={styles.helperText}>
                    Works multiple muscle groups simultaneously
                  </span>
                </label>
              )}
            />
          </div>

          <Controller
            name="instructions_en"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Instructions (English)"
                placeholder="Describe how to perform this exercise..."
                error={errors.instructions_en?.message}
                rows={4}
                required
              />
            )}
          />

          <Controller
            name="instructions_es"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Instructions (Spanish)"
                placeholder="Describe cómo realizar este ejercicio..."
                error={errors.instructions_es?.message}
                rows={4}
                required
              />
            )}
          />

          <Controller
            name="media_url"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Image URL (Optional)"
                placeholder="https://example.com/exercise-image.jpg"
                error={errors.media_url?.message}
                helperText="URL to an image demonstrating the exercise"
              />
            )}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || !!slugError || isLoading}
            loading={isLoading}
          >
            {isEditing ? 'Update Exercise' : 'Create Exercise'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CustomExerciseForm;