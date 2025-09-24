import { z } from 'zod';

// Profile form validation
export const profileFormSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
});

// Preferences form validation
export const preferencesFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    message: 'Please select a valid theme',
  }),
  language: z.enum(['en', 'es'], {
    message: 'Please select a valid language',
  }),
  units: z.enum(['metric', 'imperial'], {
    message: 'Please select a valid unit system',
  }),
});

// Password form validation
export const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Export options validation
export const exportOptionsSchema = z.object({
  includeWorkouts: z.boolean().default(true),
  includeWeightLogs: z.boolean().default(true),
  includePlans: z.boolean().default(true),
  format: z.enum(['json', 'csv']).default('json'),
  dateRange: z
    .object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
    })
    .optional()
    .refine(
      (data) => {
        if (!data) return true;
        return new Date(data.start) <= new Date(data.end);
      },
      {
        message: 'Start date must be before or equal to end date',
        path: ['start'],
      }
    ),
});

// Type exports
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type PreferencesFormData = z.infer<typeof preferencesFormSchema>;
export type PasswordFormData = z.infer<typeof passwordFormSchema>;
export type ExportOptionsData = z.infer<typeof exportOptionsSchema>;