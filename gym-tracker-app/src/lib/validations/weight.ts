import { z } from 'zod';

// Weight validation schema
export const weightLogSchema = z.object({
  weight: z
    .number()
    .min(20, 'Weight must be at least 20 lbs (9 kg)')
    .max(800, 'Weight must be less than 800 lbs (363 kg)'),
  measured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Weight goal schema (optional feature)
export const weightGoalSchema = z.object({
  target_weight: z
    .number()
    .min(20, 'Target weight must be at least 20 lbs (9 kg)')
    .max(800, 'Target weight must be less than 800 lbs (363 kg)'),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  goal_type: z.enum(['lose', 'gain', 'maintain']),
});

// Export types
export type WeightLogFormData = z.infer<typeof weightLogSchema>;
export type WeightGoalFormData = z.infer<typeof weightGoalSchema>;