import { z } from 'zod';

// Exercise set validation schema
export const exerciseSetSchema = z.object({
  weight: z
    .number()
    .min(0, 'Weight must be positive')
    .max(1000, 'Weight must be less than 1000')
    .nullable()
    .optional(),
  reps: z
    .number()
    .int('Reps must be a whole number')
    .min(1, 'Reps must be at least 1')
    .max(100, 'Reps must be less than 100')
    .nullable()
    .optional(),
  rpe: z
    .number()
    .min(1, 'RPE must be between 1 and 10')
    .max(10, 'RPE must be between 1 and 10')
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .nullable()
    .optional(),
});

// Exercise validation schema
export const exerciseSchema = z.object({
  slug: z.string().min(1, 'Exercise slug is required'),
  name_en: z.string().min(1, 'Exercise name is required'),
  name_es: z.string().min(1, 'Exercise name in Spanish is required'),
  machine_brand: z.string().nullable().optional(),
  target_sets: z
    .number()
    .int('Target sets must be a whole number')
    .min(1, 'Target sets must be at least 1')
    .max(20, 'Target sets must be less than 20'),
  target_reps: z
    .number()
    .int('Target reps must be a whole number')
    .min(1, 'Target reps must be at least 1')
    .max(100, 'Target reps must be less than 100'),
});

// Workout validation schema
export const workoutSchema = z.object({
  title: z
    .string()
    .min(1, 'Workout title is required')
    .max(100, 'Workout title must be less than 100 characters'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional(),
  duration_minutes: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration must be less than 10 hours')
    .nullable()
    .optional(),
});

// Weight log validation schema
export const weightLogSchema = z.object({
  weight: z
    .number()
    .min(20, 'Weight must be at least 20 lbs/kg')
    .max(800, 'Weight must be less than 800 lbs/kg'),
  measured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .nullable()
    .optional(),
});

// Set input validation for forms
export const setInputSchema = z.object({
  weight: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Weight must be a positive number'
    )
    .optional(),
  reps: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1),
      'Reps must be a positive whole number'
    )
    .optional(),
  rpe: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 1 && parseFloat(val) <= 10),
      'RPE must be between 1 and 10'
    )
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

// Export types
export type ExerciseSetData = z.infer<typeof exerciseSetSchema>;
export type ExerciseData = z.infer<typeof exerciseSchema>;
export type WorkoutData = z.infer<typeof workoutSchema>;
export type WeightLogData = z.infer<typeof weightLogSchema>;
export type SetInputData = z.infer<typeof setInputSchema>;

// Validation helper functions
export const validateSetInput = (data: unknown) => {
  return setInputSchema.safeParse(data);
};

export const validateExerciseSet = (data: unknown) => {
  return exerciseSetSchema.safeParse(data);
};

export const validateWorkout = (data: unknown) => {
  return workoutSchema.safeParse(data);
};

export const validateWeightLog = (data: unknown) => {
  return weightLogSchema.safeParse(data);
};