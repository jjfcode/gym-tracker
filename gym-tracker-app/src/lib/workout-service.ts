/**
 * Workout service for managing workout data
 */

import { supabase } from './supabase';
import type { Workout, WorkoutTemplate, ExerciseSet } from '../types/workout';

export class WorkoutService {
  // Get today's workout
  async getTodaysWorkout(userId: string): Promise<Workout | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises:workout_exercises(
          *,
          exercise:exercises(*),
          sets:exercise_sets(*)
        )
      `)
      .eq('user_id', userId)
      .gte('started_at', `${today}T00:00:00`)
      .lt('started_at', `${today}T23:59:59`)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  // Get workout templates
  async getWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Start a new workout
  async startWorkout(userId: string, templateId?: string): Promise<Workout> {
    const workoutData = {
      user_id: userId,
      name: templateId ? undefined : 'Quick Workout',
      template_id: templateId,
      started_at: new Date().toISOString(),
      status: 'in_progress'
    };

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single();

    if (error) throw error;

    // If using a template, copy exercises
    if (templateId) {
      const { data: templateExercises } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', templateId);

      if (templateExercises) {
        for (const templateExercise of templateExercises) {
          const { data: workoutExercise } = await supabase
            .from('workout_exercises')
            .insert({
              workout_id: workout.id,
              exercise_id: templateExercise.exercise_id,
              order_index: templateExercise.order_index,
              target_sets: templateExercise.target_sets,
              target_reps: templateExercise.target_reps,
              target_weight: templateExercise.target_weight
            })
            .select()
            .single();

          // Create placeholder sets
          if (workoutExercise && templateExercise.target_sets) {
            const sets = Array.from({ length: templateExercise.target_sets }, (_, index) => ({
              workout_exercise_id: workoutExercise.id,
              set_number: index + 1,
              target_reps: templateExercise.target_reps,
              target_weight: templateExercise.target_weight
            }));

            await supabase
              .from('exercise_sets')
              .insert(sets);
          }
        }
      }
    }

    // Return workout with exercises
    return this.getTodaysWorkout(userId) || workout;
  }

  // Complete workout
  async completeWorkout(workoutId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', workoutId);

    if (error) throw error;
  }

  // Update exercise set
  async updateExerciseSet(setId: string, data: Partial<ExerciseSet>): Promise<void> {
    const { error } = await supabase
      .from('exercise_sets')
      .update(data)
      .eq('id', setId);

    if (error) throw error;
  }

  // Add exercise to workout
  async addExerciseToWorkout(workoutId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        order_index: 0 // This should be calculated based on existing exercises
      });

    if (error) throw error;
  }
}

export const workoutService = new WorkoutService();