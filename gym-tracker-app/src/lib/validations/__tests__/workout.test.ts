import { describe, it, expect } from 'vitest';
import {
  exerciseSetSchema,
  exerciseSchema,
  workoutSchema,
  weightLogSchema,
  setInputSchema,
  validateSetInput,
  validateExerciseSet,
  validateWorkout,
  validateWeightLog,
} from '../workout';

describe('Workout Validation Schemas', () => {
  describe('exerciseSetSchema', () => {
    it('should validate valid exercise set data', () => {
      const validData = {
        weight: 135.5,
        reps: 10,
        rpe: 8.5,
        notes: 'Good set',
      };

      const result = exerciseSetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow null values', () => {
      const validData = {
        weight: null,
        reps: null,
        rpe: null,
        notes: null,
      };

      const result = exerciseSetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative weight', () => {
      const invalidData = {
        weight: -10,
        reps: 10,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be positive');
      }
    });

    it('should reject weight over 1000', () => {
      const invalidData = {
        weight: 1001,
        reps: 10,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be less than 1000');
      }
    });

    it('should reject reps less than 1', () => {
      const invalidData = {
        weight: 100,
        reps: 0,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reps must be at least 1');
      }
    });

    it('should reject reps over 100', () => {
      const invalidData = {
        weight: 100,
        reps: 101,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reps must be less than 100');
      }
    });

    it('should reject non-integer reps', () => {
      const invalidData = {
        weight: 100,
        reps: 10.5,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reps must be a whole number');
      }
    });

    it('should reject RPE less than 1', () => {
      const invalidData = {
        weight: 100,
        reps: 10,
        rpe: 0.5,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('RPE must be between 1 and 10');
      }
    });

    it('should reject RPE over 10', () => {
      const invalidData = {
        weight: 100,
        reps: 10,
        rpe: 10.5,
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('RPE must be between 1 and 10');
      }
    });

    it('should reject notes over 500 characters', () => {
      const invalidData = {
        weight: 100,
        reps: 10,
        notes: 'a'.repeat(501),
      };

      const result = exerciseSetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Notes must be less than 500 characters');
      }
    });
  });

  describe('exerciseSchema', () => {
    it('should validate valid exercise data', () => {
      const validData = {
        slug: 'bench-press',
        name_en: 'Bench Press',
        name_es: 'Press de Banca',
        machine_brand: 'Hammer Strength',
        target_sets: 3,
        target_reps: 10,
      };

      const result = exerciseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty slug', () => {
      const invalidData = {
        slug: '',
        name_en: 'Bench Press',
        name_es: 'Press de Banca',
        target_sets: 3,
        target_reps: 10,
      };

      const result = exerciseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject target_sets over 20', () => {
      const invalidData = {
        slug: 'bench-press',
        name_en: 'Bench Press',
        name_es: 'Press de Banca',
        target_sets: 21,
        target_reps: 10,
      };

      const result = exerciseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Target sets must be less than 20');
      }
    });
  });

  describe('workoutSchema', () => {
    it('should validate valid workout data', () => {
      const validData = {
        title: 'Upper Body Workout',
        date: '2024-01-15',
        notes: 'Great workout today',
        duration_minutes: 60,
      };

      const result = workoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        title: 'Upper Body Workout',
        date: '01/15/2024',
      };

      const result = workoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format');
      }
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        date: '2024-01-15',
      };

      const result = workoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Workout title is required');
      }
    });
  });

  describe('weightLogSchema', () => {
    it('should validate valid weight log data', () => {
      const validData = {
        weight: 175.5,
        measured_at: '2024-01-15',
        note: 'Morning weight',
      };

      const result = weightLogSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weight under 20', () => {
      const invalidData = {
        weight: 19,
        measured_at: '2024-01-15',
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be at least 20 lbs/kg');
      }
    });

    it('should reject weight over 800', () => {
      const invalidData = {
        weight: 801,
        measured_at: '2024-01-15',
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be less than 800 lbs/kg');
      }
    });
  });

  describe('setInputSchema', () => {
    it('should validate valid string inputs', () => {
      const validData = {
        weight: '135.5',
        reps: '10',
        rpe: '8.5',
        notes: 'Good set',
      };

      const result = setInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty strings', () => {
      const validData = {
        weight: '',
        reps: '',
        rpe: '',
        notes: '',
      };

      const result = setInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid weight string', () => {
      const invalidData = {
        weight: 'abc',
        reps: '10',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be a positive number');
      }
    });

    it('should reject negative weight string', () => {
      const invalidData = {
        weight: '-10',
        reps: '10',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be a positive number');
      }
    });

    it('should reject invalid reps string', () => {
      const invalidData = {
        weight: '100',
        reps: 'abc',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reps must be a positive whole number');
      }
    });

    it('should reject zero reps', () => {
      const invalidData = {
        weight: '100',
        reps: '0',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reps must be a positive whole number');
      }
    });

    it('should reject invalid RPE string', () => {
      const invalidData = {
        weight: '100',
        reps: '10',
        rpe: 'abc',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('RPE must be between 1 and 10');
      }
    });

    it('should reject RPE over 10', () => {
      const invalidData = {
        weight: '100',
        reps: '10',
        rpe: '11',
      };

      const result = setInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('RPE must be between 1 and 10');
      }
    });
  });

  describe('validation helper functions', () => {
    it('validateSetInput should work correctly', () => {
      const validData = {
        weight: '100',
        reps: '10',
        rpe: '8',
        notes: 'Good set',
      };

      const result = validateSetInput(validData);
      expect(result.success).toBe(true);
    });

    it('validateExerciseSet should work correctly', () => {
      const validData = {
        weight: 100,
        reps: 10,
        rpe: 8,
        notes: 'Good set',
      };

      const result = validateExerciseSet(validData);
      expect(result.success).toBe(true);
    });

    it('validateWorkout should work correctly', () => {
      const validData = {
        title: 'Upper Body Workout',
        date: '2024-01-15',
        notes: 'Great workout',
        duration_minutes: 60,
      };

      const result = validateWorkout(validData);
      expect(result.success).toBe(true);
    });

    it('validateWeightLog should work correctly', () => {
      const validData = {
        weight: 175,
        measured_at: '2024-01-15',
        note: 'Morning weight',
      };

      const result = validateWeightLog(validData);
      expect(result.success).toBe(true);
    });
  });
});