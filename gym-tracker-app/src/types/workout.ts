// Workout template and exercise library types

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  frequency: number; // days per week
  type: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'custom';
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  slug: string;
  name_en: string;
  name_es: string;
  target_sets: number;
  target_reps: number;
  muscle_groups: MuscleGroup[];
  equipment?: Equipment;
  instructions_en?: string;
  instructions_es?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_compound: boolean;
}

export interface ExerciseLibraryItem {
  slug: string;
  name_en: string;
  name_es: string;
  muscle_groups: MuscleGroup[];
  equipment: Equipment;
  instructions_en: string;
  instructions_es: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_compound: boolean;
  variations?: string[];
  media_url?: string;
}

export interface WorkoutPlan {
  id: number;
  user_id: string;
  template_id: string;
  goal_days_per_week: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  customizations: PlanCustomization[];
  weekly_schedule: WeeklySchedule;
}

export interface WeeklySchedule {
  monday?: WorkoutDay;
  tuesday?: WorkoutDay;
  wednesday?: WorkoutDay;
  thursday?: WorkoutDay;
  friday?: WorkoutDay;
  saturday?: WorkoutDay;
  sunday?: WorkoutDay;
}

export interface WorkoutDay {
  type: 'workout' | 'rest';
  template_name?: string;
  exercises?: TemplateExercise[];
  is_custom?: boolean;
}

export interface PlanCustomization {
  exercise_slug: string;
  action: 'replace' | 'remove' | 'modify';
  replacement_exercise?: string;
  modified_sets?: number;
  modified_reps?: number;
  notes?: string;
}

export interface WorkoutGeneration {
  template: WorkoutTemplate;
  user_preferences: UserWorkoutPreferences;
  start_date: string;
  weeks_to_generate: number;
}

export interface UserWorkoutPreferences {
  goal_days_per_week: number;
  preferred_equipment: Equipment[];
  excluded_exercises: string[];
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced';
  workout_duration_minutes: number;
  rest_days: DayOfWeek[];
}

export interface GeneratedWorkout {
  date: string;
  title: string;
  type: string;
  exercises: TemplateExercise[];
  estimated_duration: number;
}

// Enums and constants
export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'lats'
  | 'rhomboids'
  | 'rear-delts';

export type Equipment = 
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'resistance-band'
  | 'kettlebell'
  | 'smith-machine'
  | 'pull-up-bar'
  | 'bench'
  | 'none';

export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// Template selection criteria
export interface TemplateSelectionCriteria {
  frequency: number;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  available_equipment: Equipment[];
  time_per_session: number;
  goals: WorkoutGoal[];
}

export type WorkoutGoal = 
  | 'strength'
  | 'muscle-building'
  | 'endurance'
  | 'weight-loss'
  | 'general-fitness'
  | 'sport-specific';

// Progress tracking types
export interface ExerciseProgress {
  exercise_slug: string;
  date: string;
  best_set: {
    weight: number;
    reps: number;
    rpe?: number;
  };
  volume: number; // total weight * reps
  one_rep_max_estimate?: number;
}

export interface WorkoutProgress {
  workout_id: number;
  completion_rate: number; // percentage of exercises completed
  total_volume: number;
  duration_minutes: number;
  average_rpe?: number;
}