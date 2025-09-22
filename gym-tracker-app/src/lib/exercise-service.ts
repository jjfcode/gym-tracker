/**
 * Exercise service for managing exercise library
 */

import { supabase } from './supabase';
import type { Exercise, ExerciseFilters } from '../types/exercise';

export interface ExerciseSearchParams extends ExerciseFilters {
  userId: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ExerciseService {
  // Get exercises with filters
  async getExercises(params: ExerciseSearchParams): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .or(`created_by.is.null,created_by.eq.${params.userId}`); // Public exercises or user's custom exercises

    // Apply search filter
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    // Apply category filter
    if (params.category) {
      query = query.eq('category', params.category);
    }

    // Apply muscle group filter
    if (params.muscleGroup) {
      query = query.contains('primary_muscles', [params.muscleGroup]);
    }

    // Apply equipment filter
    if (params.equipment) {
      query = query.eq('equipment', params.equipment);
    }

    // Apply difficulty filter
    if (params.difficulty) {
      query = query.eq('difficulty', params.difficulty);
    }

    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    // Order by name
    query = query.order('name');

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Get exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  // Create custom exercise
  async createExercise(userId: string, exerciseData: Omit<Exercise, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        ...exerciseData,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update exercise (only if user created it)
  async updateExercise(userId: string, exerciseId: string, updates: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete exercise (only if user created it)
  async deleteExercise(userId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('created_by', userId);

    if (error) throw error;
  }

  // Get exercise categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set((data || []).map(item => item.category))];
    return categories.sort();
  }

  // Get muscle groups
  async getMuscleGroups(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('primary_muscles, secondary_muscles')
      .not('primary_muscles', 'is', null);

    if (error) throw error;

    // Flatten and get unique muscle groups
    const allMuscles = new Set<string>();
    
    (data || []).forEach(exercise => {
      if (exercise.primary_muscles) {
        exercise.primary_muscles.forEach((muscle: string) => allMuscles.add(muscle));
      }
      if (exercise.secondary_muscles) {
        exercise.secondary_muscles.forEach((muscle: string) => allMuscles.add(muscle));
      }
    });

    return Array.from(allMuscles).sort();
  }

  // Get equipment types
  async getEquipmentTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('equipment')
      .not('equipment', 'is', null);

    if (error) throw error;

    // Get unique equipment types
    const equipment = [...new Set((data || []).map(item => item.equipment))];
    return equipment.sort();
  }

  // Search exercises by name
  async searchExercises(query: string, limit: number = 10): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get popular exercises (most used in workouts)
  async getPopularExercises(userId: string, limit: number = 10): Promise<Exercise[]> {
    // This would require a more complex query joining with workout_exercises
    // For now, return a simple query
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`created_by.is.null,created_by.eq.${userId}`)
      .limit(limit)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get user's favorite exercises
  async getFavoriteExercises(userId: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercise_favorites')
      .select(`
        exercise:exercises(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(item => item.exercise).filter(Boolean);
  }

  // Add exercise to favorites
  async addToFavorites(userId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercise_favorites')
      .upsert({
        user_id: userId,
        exercise_id: exerciseId
      }, {
        onConflict: 'user_id,exercise_id'
      });

    if (error) throw error;
  }

  // Remove exercise from favorites
  async removeFromFavorites(userId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercise_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId);

    if (error) throw error;
  }

  // Get exercise history for a user
  async getExerciseHistory(userId: string, exerciseId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        *,
        workout_exercise:workout_exercises(
          workout:workouts(completed_at)
        )
      `)
      .eq('workout_exercise.exercise_id', exerciseId)
      .eq('workout_exercise.workout.user_id', userId)
      .not('workout_exercise.workout.completed_at', 'is', null)
      .order('workout_exercise.workout.completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export const exerciseService = new ExerciseService();