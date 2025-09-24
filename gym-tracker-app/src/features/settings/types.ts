import type { UserProfile, Workout, Exercise, WeightLog, Plan } from '../../types/common';

// Settings form data types
export interface ProfileFormData {
  display_name: string;
  email: string;
  timezone: string;
}

export interface PreferencesFormData {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es';
  units: 'metric' | 'imperial';
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Settings sections
export type SettingsSection = 'profile' | 'preferences' | 'security' | 'data';

// Data export types
export interface ExportData {
  profile: UserProfile;
  workouts: Workout[];
  exercises: Exercise[];
  weightLogs: WeightLog[];
  plans: Plan[];
  exportedAt: string;
}

export interface ExportOptions {
  includeWorkouts: boolean;
  includeWeightLogs: boolean;
  includePlans: boolean;
  format: 'json' | 'csv';
  dateRange?: {
    start: string;
    end: string;
  };
}

// Settings state
export interface SettingsState {
  activeSection: SettingsSection;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}