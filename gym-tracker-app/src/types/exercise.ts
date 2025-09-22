/**
 * Exercise-related type definitions
 */

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

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdBy?: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  description?: string;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
}

export interface ExerciseFavorite {
  id: string;
  user_id: string;
  exercise_id: string;
  created_at: string;
}

export interface ExerciseHistory {
  id: string;
  exercise_id: string;
  workout_id: string;
  date: string;
  sets: ExerciseSetHistory[];
}

export interface ExerciseSetHistory {
  set_number: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  distance?: number;
  duration?: number;
}