import { supabase } from '../../../lib/supabase';
import { validateExerciseSet } from '../../../lib/validations/workout';
import type { Database } from '../../../types/database';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];
type ExerciseSetInsert = Database['public']['Tables']['exercise_sets']['Insert'];
type ExerciseSetUpdate = Database['public']['Tables']['exercise_sets']['Update'];

export interface CreateSetParams {
  exerciseId: number;
  setIndex: number;
  weight?: number | null;
  reps?: number | null;
  rpe?: number | null;
  notes?: string | null;
}

export interface UpdateSetParams {
  setId: number;
  weight?: number | null;
  reps?: number | null;
  rpe?: number | null;
  notes?: string | null;
}

export interface SetProgress {
  exerciseId: number;
  completedSets: number;
  totalSets: number;
  isCompleted: boolean;
  totalVolume: number;
  averageRpe?: number;
}

export class ExerciseSetService {
  /**
   * Create a new exercise set
   */
  static async createSet(userId: string, params: CreateSetParams): Promise<ExerciseSet> {
    // Validate input data
    const validation = validateExerciseSet({
      weight: params.weight,
      reps: params.reps,
      rpe: params.rpe,
      notes: params.notes,
    });

    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
    }

    const setData: ExerciseSetInsert = {
      user_id: userId,
      exercise_id: params.exerciseId,
      set_index: params.setIndex,
      weight: params.weight,
      reps: params.reps,
      rpe: params.rpe,
      notes: params.notes,
    };

    const { data, error } = await supabase
      .from('exercise_sets')
      .insert(setData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create exercise set: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing exercise set
   */
  static async updateSet(userId: string, params: UpdateSetParams): Promise<ExerciseSet> {
    // Validate input data
    const validation = validateExerciseSet({
      weight: params.weight,
      reps: params.reps,
      rpe: params.rpe,
      notes: params.notes,
    });

    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
    }

    const updateData: ExerciseSetUpdate = {
      weight: params.weight,
      reps: params.reps,
      rpe: params.rpe,
      notes: params.notes,
    };

    const { data, error } = await supabase
      .from('exercise_sets')
      .update(updateData)
      .eq('id', params.setId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update exercise set: ${error.message}`);
    }

    return data;
  }

  /**
   * Upsert (create or update) an exercise set
   */
  static async upsertSet(
    userId: string, 
    exerciseId: number, 
    setIndex: number, 
    setData: Partial<ExerciseSet>
  ): Promise<ExerciseSet> {
    // First, try to find existing set
    const { data: existingSet } = await supabase
      .from('exercise_sets')
      .select('id')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('set_index', setIndex)
      .single();

    if (existingSet) {
      // Update existing set
      return this.updateSet(userId, {
        setId: existingSet.id,
        weight: setData.weight,
        reps: setData.reps,
        rpe: setData.rpe,
        notes: setData.notes,
      });
    } else {
      // Create new set
      return this.createSet(userId, {
        exerciseId,
        setIndex,
        weight: setData.weight,
        reps: setData.reps,
        rpe: setData.rpe,
        notes: setData.notes,
      });
    }
  }

  /**
   * Delete an exercise set
   */
  static async deleteSet(userId: string, setId: number): Promise<void> {
    const { error } = await supabase
      .from('exercise_sets')
      .delete()
      .eq('id', setId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete exercise set: ${error.message}`);
    }
  }

  /**
   * Get all sets for an exercise
   */
  static async getExerciseSets(userId: string, exerciseId: number): Promise<ExerciseSet[]> {
    const { data, error } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('set_index');

    if (error) {
      throw new Error(`Failed to fetch exercise sets: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calculate exercise progress
   */
  static calculateExerciseProgress(
    sets: ExerciseSet[], 
    targetSets: number
  ): SetProgress {
    const completedSets = sets.filter(set => 
      set.weight !== null && set.weight > 0 && 
      set.reps !== null && set.reps > 0
    );

    const totalVolume = completedSets.reduce((sum, set) => {
      return sum + ((set.weight || 0) * (set.reps || 0));
    }, 0);

    const rpeValues = completedSets
      .map(set => set.rpe)
      .filter((rpe): rpe is number => rpe !== null && rpe !== undefined);
    
    const averageRpe = rpeValues.length > 0 
      ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length 
      : undefined;

    return {
      exerciseId: sets[0]?.exercise_id || 0,
      completedSets: completedSets.length,
      totalSets: targetSets,
      isCompleted: completedSets.length >= targetSets,
      totalVolume,
      averageRpe,
    };
  }

  /**
   * Get exercise progress for multiple exercises
   */
  static async getExerciseProgressBatch(
    userId: string, 
    exerciseIds: number[]
  ): Promise<Map<number, SetProgress>> {
    const progressMap = new Map<number, SetProgress>();

    // Get all sets for the exercises
    const { data: sets, error } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('user_id', userId)
      .in('exercise_id', exerciseIds)
      .order('exercise_id, set_index');

    if (error) {
      throw new Error(`Failed to fetch exercise sets: ${error.message}`);
    }

    // Get exercise target sets
    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('id, target_sets')
      .eq('user_id', userId)
      .in('id', exerciseIds);

    if (exerciseError) {
      throw new Error(`Failed to fetch exercises: ${exerciseError.message}`);
    }

    // Group sets by exercise and calculate progress
    const setsByExercise = new Map<number, ExerciseSet[]>();
    sets?.forEach(set => {
      const exerciseSets = setsByExercise.get(set.exercise_id) || [];
      exerciseSets.push(set);
      setsByExercise.set(set.exercise_id, exerciseSets);
    });

    exercises?.forEach(exercise => {
      const exerciseSets = setsByExercise.get(exercise.id) || [];
      const progress = this.calculateExerciseProgress(exerciseSets, exercise.target_sets);
      progressMap.set(exercise.id, progress);
    });

    return progressMap;
  }

  /**
   * Bulk update multiple sets (for optimistic updates)
   */
  static async bulkUpdateSets(
    userId: string, 
    updates: Array<{ setId: number; data: Partial<ExerciseSet> }>
  ): Promise<ExerciseSet[]> {
    const results: ExerciseSet[] = [];

    // Process updates in parallel
    const updatePromises = updates.map(async ({ setId, data }) => {
      return this.updateSet(userId, {
        setId,
        weight: data.weight,
        reps: data.reps,
        rpe: data.rpe,
        notes: data.notes,
      });
    });

    try {
      const updatedSets = await Promise.all(updatePromises);
      results.push(...updatedSets);
    } catch (error) {
      throw new Error(`Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }
}