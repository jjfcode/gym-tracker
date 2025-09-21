import type { ExerciseLibraryItem, MuscleGroup, Equipment } from '../../types/workout';

export interface CustomExercise extends Omit<ExerciseLibraryItem, 'slug'> {
  id?: number;
  user_id: string;
  slug: string;
  is_custom: true;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseSearchFilters {
  searchQuery: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: ('beginner' | 'intermediate' | 'advanced')[];
  compoundOnly: boolean;
  customOnly: boolean;
}

export interface ExerciseSelectionProps {
  selectedExercises: string[];
  onExerciseSelect: (exerciseSlug: string) => void;
  onExerciseDeselect: (exerciseSlug: string) => void;
  maxSelections?: number;
  excludeExercises?: string[];
}

export interface WorkoutExerciseModification {
  exercise_id: number;
  action: 'reorder' | 'modify' | 'remove';
  new_order?: number;
  new_sets?: number;
  new_reps?: number;
  notes?: string;
}

export interface ExerciseReorderItem {
  id: number;
  slug: string;
  name: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
}