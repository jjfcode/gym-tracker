import { z } from 'zod';

export const muscleGroupSchema = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'traps',
  'lats',
  'rhomboids',
  'rear-delts',
]);

export const equipmentSchema = z.enum([
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'resistance-band',
  'kettlebell',
  'smith-machine',
  'pull-up-bar',
  'bench',
  'none',
]);

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const customExerciseSchema = z.object({
  slug: z
    .string()
    .min(1, 'Exercise slug is required')
    .max(100, 'Exercise slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  name_en: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name must be less than 100 characters'),
  name_es: z
    .string()
    .min(1, 'Spanish name is required')
    .max(100, 'Spanish name must be less than 100 characters'),
  muscle_groups: z
    .array(muscleGroupSchema)
    .min(1, 'At least one muscle group is required')
    .max(5, 'Maximum 5 muscle groups allowed'),
  equipment: equipmentSchema,
  instructions_en: z
    .string()
    .min(10, 'English instructions must be at least 10 characters')
    .max(1000, 'English instructions must be less than 1000 characters'),
  instructions_es: z
    .string()
    .min(10, 'Spanish instructions must be at least 10 characters')
    .max(1000, 'Spanish instructions must be less than 1000 characters'),
  difficulty_level: difficultySchema,
  is_compound: z.boolean(),
  variations: z
    .array(z.string().max(100))
    .max(10, 'Maximum 10 variations allowed')
    .optional(),
  media_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const exerciseModificationSchema = z.object({
  target_sets: z
    .number()
    .min(1, 'Must have at least 1 set')
    .max(20, 'Maximum 20 sets allowed')
    .optional(),
  target_reps: z
    .number()
    .min(1, 'Must have at least 1 rep')
    .max(100, 'Maximum 100 reps allowed')
    .optional(),
  order_index: z
    .number()
    .min(0, 'Order index must be non-negative')
    .optional(),
});

export const exerciseSearchSchema = z.object({
  searchQuery: z.string().max(100, 'Search query too long').optional(),
  muscleGroups: z.array(muscleGroupSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  difficulty: z.array(difficultySchema).optional(),
  compoundOnly: z.boolean().optional(),
  customOnly: z.boolean().optional(),
});

export type CustomExerciseFormData = z.infer<typeof customExerciseSchema>;
export type ExerciseModificationData = z.infer<typeof exerciseModificationSchema>;
export type ExerciseSearchData = z.infer<typeof exerciseSearchSchema>;