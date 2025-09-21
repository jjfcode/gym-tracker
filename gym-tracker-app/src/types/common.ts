// Common type definitions

export interface BaseEntity {
  id: string | number;
  created_at: string;
  updated_at?: string;
}

export interface User extends BaseEntity {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface UserProfile extends BaseEntity {
  user_id: string;
  display_name: string;
  locale: 'en' | 'es';
  units: 'metric' | 'imperial';
  theme: 'dark' | 'light' | 'system';
}

export interface WeightLog extends BaseEntity {
  id: number;
  user_id: string;
  measured_at: string;
  weight: number;
  note?: string;
}

export interface Workout extends BaseEntity {
  id: number;
  user_id: string;
  plan_id: number;
  date: string;
  title: string;
  is_completed: boolean;
  duration_minutes?: number;
  notes?: string;
  exercises: Exercise[];
}

export interface Exercise extends BaseEntity {
  id: number;
  workout_id: number;
  slug: string;
  name_en: string;
  name_es: string;
  machine_brand?: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  sets: ExerciseSet[];
}

export interface ExerciseSet extends BaseEntity {
  id: number;
  exercise_id: number;
  set_index: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
}

export interface Plan extends BaseEntity {
  id: number;
  user_id: string;
  goal_days_per_week: number;
  plan_scope: string;
  start_date: string;
  meta: Record<string, unknown>;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// UI Component Props
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
