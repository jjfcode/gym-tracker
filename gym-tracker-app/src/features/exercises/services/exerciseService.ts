import { supabase } from '../../../lib/supabase';
import type { CustomExercise } from '../types';
import type { ExerciseLibraryItem } from '../../../types/workout';

export class ExerciseService {
  // Custom exercises CRUD operations
  static async createCustomExercise(exercise: Omit<CustomExercise, 'id' | 'created_at' | 'updated_at'>): Promise<CustomExercise> {
    const { data, error } = await supabase
      .from('custom_exercises')
      .insert({
        user_id: exercise.user_id,
        slug: exercise.slug,
        name_en: exercise.name_en,
        name_es: exercise.name_es,
        muscle_groups: exercise.muscle_groups,
        equipment: exercise.equipment,
        instructions_en: exercise.instructions_en,
        instructions_es: exercise.instructions_es,
        difficulty_level: exercise.difficulty_level,
        is_compound: exercise.is_compound,
        variations: exercise.variations || [],
        media_url: exercise.media_url,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create custom exercise: ${error.message}`);
    }

    return { ...data, is_custom: true };
  }

  static async getCustomExercises(userId: string): Promise<CustomExercise[]> {
    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch custom exercises: ${error.message}`);
    }

    return data.map(exercise => ({ ...exercise, is_custom: true }));
  }

  static async getCustomExerciseById(id: number): Promise<CustomExercise | null> {
    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch custom exercise: ${error.message}`);
    }

    return { ...data, is_custom: true };
  }

  static async updateCustomExercise(id: number, updates: Partial<CustomExercise>): Promise<CustomExercise> {
    const { data, error } = await supabase
      .from('custom_exercises')
      .update({
        name_en: updates.name_en,
        name_es: updates.name_es,
        muscle_groups: updates.muscle_groups,
        equipment: updates.equipment,
        instructions_en: updates.instructions_en,
        instructions_es: updates.instructions_es,
        difficulty_level: updates.difficulty_level,
        is_compound: updates.is_compound,
        variations: updates.variations,
        media_url: updates.media_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update custom exercise: ${error.message}`);
    }

    return { ...data, is_custom: true };
  }

  static async deleteCustomExercise(id: number): Promise<void> {
    const { error } = await supabase
      .from('custom_exercises')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete custom exercise: ${error.message}`);
    }
  }

  // Workout exercise modifications
  static async reorderWorkoutExercises(workoutId: number, exerciseOrders: { id: number; order_index: number }[]): Promise<void> {
    const updates = exerciseOrders.map(({ id, order_index }) => 
      supabase
        .from('exercises')
        .update({ order_index })
        .eq('id', id)
        .eq('workout_id', workoutId)
    );

    const results = await Promise.all(updates);
    
    for (const { error } of results) {
      if (error) {
        throw new Error(`Failed to reorder exercises: ${error.message}`);
      }
    }
  }

  static async updateWorkoutExercise(exerciseId: number, updates: {
    target_sets?: number;
    target_reps?: number;
    order_index?: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId);

    if (error) {
      throw new Error(`Failed to update workout exercise: ${error.message}`);
    }
  }

  static async removeWorkoutExercise(exerciseId: number): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      throw new Error(`Failed to remove workout exercise: ${error.message}`);
    }
  }

  static async addExerciseToWorkout(workoutId: number, exercise: {
    slug: string;
    name_en: string;
    name_es: string;
    target_sets: number;
    target_reps: number;
    order_index: number;
    machine_brand?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...exercise,
      });

    if (error) {
      throw new Error(`Failed to add exercise to workout: ${error.message}`);
    }
  }

  // Utility methods
  static async validateExerciseSlug(slug: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('custom_exercises')
      .select('id')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to validate exercise slug: ${error.message}`);
    }

    return data === null; // true if slug is available
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
      .trim();
  }
}