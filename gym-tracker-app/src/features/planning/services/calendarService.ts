import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database';
import type { WorkoutSummary, WorkoutPreviewData, RescheduleWorkoutData } from '../types';

type WorkoutRow = Database['public']['Tables']['workouts']['Row'];
type ExerciseRow = Database['public']['Tables']['exercises']['Row'];

/**
 * Get workouts for a date range
 */
export const getWorkoutsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<Record<string, WorkoutSummary>> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      id,
      date,
      title,
      is_completed,
      duration_minutes,
      exercises (
        id,
        target_sets
      )
    `)
    .eq('user_id', user.user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  // Transform to Record<date, WorkoutSummary>
  const workoutMap: Record<string, WorkoutSummary> = {};
  
  workouts?.forEach((workout) => {
    const exercises = workout.exercises as ExerciseRow[];
    const exerciseCount = exercises?.length || 0;
    
    // Calculate completion rate if workout is completed
    let completionRate: number | undefined;
    if (workout.is_completed) {
      completionRate = 100;
    }
    
    workoutMap[workout.date] = {
      id: workout.id,
      title: workout.title,
      is_completed: workout.is_completed,
      exercise_count: exerciseCount,
      duration_minutes: workout.duration_minutes || undefined,
      completion_rate: completionRate,
    };
  });

  return workoutMap;
};

/**
 * Get detailed workout data for preview
 */
export const getWorkoutPreview = async (workoutId: number): Promise<WorkoutPreviewData> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: workout, error } = await supabase
    .from('workouts')
    .select(`
      id,
      title,
      date,
      is_completed,
      duration_minutes,
      notes,
      exercises (
        id,
        name_en,
        name_es,
        target_sets,
        target_reps,
        exercise_sets (
          id,
          set_index,
          weight,
          reps
        )
      )
    `)
    .eq('id', workoutId)
    .eq('user_id', user.user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!workout) {
    throw new Error('Workout not found');
  }

  const exercises = (workout.exercises as any[])?.map((exercise) => {
    const sets = exercise.exercise_sets || [];
    const completedSets = sets.filter((set: any) => set.weight && set.reps).length;
    
    return {
      id: exercise.id,
      name_en: exercise.name_en,
      name_es: exercise.name_es,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
      completed_sets: completedSets,
    };
  }) || [];

  return {
    id: workout.id,
    title: workout.title,
    date: workout.date,
    is_completed: workout.is_completed,
    duration_minutes: workout.duration_minutes || undefined,
    exercises,
    notes: workout.notes || undefined,
  };
};

/**
 * Reschedule a workout to a new date
 */
export const rescheduleWorkout = async (data: RescheduleWorkoutData): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Check if there's already a workout on the target date
  const { data: existingWorkout } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('date', data.to_date)
    .single();

  if (existingWorkout) {
    throw new Error('A workout is already scheduled for this date');
  }

  // Update the workout date
  const { error } = await supabase
    .from('workouts')
    .update({ 
      date: data.to_date,
      notes: data.reason ? `Rescheduled: ${data.reason}` : 'Rescheduled'
    })
    .eq('id', data.workout_id)
    .eq('user_id', user.user.id);

  if (error) {
    throw error;
  }
};

/**
 * Create a new workout for a specific date
 */
export const createWorkoutForDate = async (
  date: string,
  title: string,
  templateExercises?: any[]
): Promise<number> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Create the workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      user_id: user.user.id,
      date,
      title,
      is_completed: false,
    })
    .select('id')
    .single();

  if (workoutError) {
    throw workoutError;
  }

  // Add exercises if provided
  if (templateExercises && templateExercises.length > 0) {
    const exercises = templateExercises.map((exercise, index) => ({
      user_id: user.user.id,
      workout_id: workout.id,
      slug: exercise.slug,
      name_en: exercise.name_en,
      name_es: exercise.name_es,
      order_index: index,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
    }));

    const { error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercises);

    if (exercisesError) {
      throw exercisesError;
    }
  }

  return workout.id;
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (workoutId: number): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', user.user.id);

  if (error) {
    throw error;
  }
};

/**
 * Mark workout as completed
 */
export const markWorkoutCompleted = async (workoutId: number): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('workouts')
    .update({ is_completed: true })
    .eq('id', workoutId)
    .eq('user_id', user.user.id);

  if (error) {
    throw error;
  }
};

/**
 * Get workout statistics for a date range
 */
export const getWorkoutStats = async (startDate: string, endDate: string) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('id, is_completed, duration_minutes')
    .eq('user_id', user.user.id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    throw error;
  }

  const totalWorkouts = workouts?.length || 0;
  const completedWorkouts = workouts?.filter(w => w.is_completed).length || 0;
  const totalDuration = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
  
  return {
    totalWorkouts,
    completedWorkouts,
    completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
    totalDuration,
    averageDuration: completedWorkouts > 0 ? totalDuration / completedWorkouts : 0,
  };
};