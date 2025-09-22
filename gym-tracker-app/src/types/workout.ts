/**
 * Workout-related type definitions
 */

export interface Workout {
  id: string;
  user_id: string;
  name?: string;
  template_id?: string;
  started_at?: string;
  completed_at?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  exercises?: WorkoutExercise[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  exercises?: TemplateExercise[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  target_sets?: number;
  target_reps?: number;
  target_weight?: number;
  target_rpe?: number;
  notes?: string;
  sets?: ExerciseSet[];
  created_at: string;
  updated_at: string;
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  target_sets?: number;
  target_reps?: number;
  target_weight?: number;
  target_rpe?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  distance?: number;
  duration?: number;
  target_reps?: number;
  target_weight?: number;
  target_rpe?: number;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string[];
  category: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
  video_url?: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}