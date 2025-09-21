import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';
import type { Database } from '../../../types/database';

type Workout = Database['public']['Tables']['workouts']['Row'];
type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

export interface WorkoutHistoryItem extends Workout {
  exercises: (Exercise & {
    sets: ExerciseSet[];
  })[];
  completionPercentage: number;
  totalVolume: number;
  averageRpe?: number;
}

export interface WorkoutHistoryFilters {
  startDate?: string;
  endDate?: string;
  isCompleted?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Hook to get workout history with pagination and filtering
 */
export const useWorkoutHistory = (filters: WorkoutHistoryFilters = {}) => {
  const { user } = useAuth();
  const { startDate, endDate, isCompleted, limit = 20, offset = 0 } = filters;
  
  return useQuery({
    queryKey: ['workout-history', user?.id, filters],
    queryFn: async (): Promise<{
      workouts: WorkoutHistoryItem[];
      totalCount: number;
      hasMore: boolean;
    }> => {
      if (!user) throw new Error('User not authenticated');

      // Build query with filters
      let query = supabase
        .from('workouts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      if (isCompleted !== undefined) {
        query = query.eq('is_completed', isCompleted);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: workouts, error, count } = await query;

      if (error) throw error;

      if (!workouts || workouts.length === 0) {
        return {
          workouts: [],
          totalCount: count || 0,
          hasMore: false,
        };
      }

      // Get exercises and sets for each workout
      const workoutIds = workouts.map(w => w.id);
      
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_id', workoutIds)
        .order('workout_id, order_index');

      if (exercisesError) throw exercisesError;

      const exerciseIds = exercises?.map(e => e.id) || [];
      
      const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .in('exercise_id', exerciseIds)
        .order('exercise_id, set_index');

      if (setsError) throw setsError;

      // Group data by workout
      const exercisesByWorkout = new Map<number, Exercise[]>();
      const setsByExercise = new Map<number, ExerciseSet[]>();

      exercises?.forEach(exercise => {
        const workoutExercises = exercisesByWorkout.get(exercise.workout_id) || [];
        workoutExercises.push(exercise);
        exercisesByWorkout.set(exercise.workout_id, workoutExercises);
      });

      sets?.forEach(set => {
        const exerciseSets = setsByExercise.get(set.exercise_id) || [];
        exerciseSets.push(set);
        setsByExercise.set(set.exercise_id, exerciseSets);
      });

      // Build workout history items with calculated metrics
      const workoutHistoryItems: WorkoutHistoryItem[] = workouts.map(workout => {
        const workoutExercises = exercisesByWorkout.get(workout.id) || [];
        
        const exercisesWithSets = workoutExercises.map(exercise => {
          const exerciseSets = setsByExercise.get(exercise.id) || [];
          return {
            ...exercise,
            sets: exerciseSets,
          };
        });

        // Calculate metrics
        let completedExercises = 0;
        let totalVolume = 0;
        let totalRpe = 0;
        let rpeCount = 0;

        exercisesWithSets.forEach(exercise => {
          const completedSets = exercise.sets.filter(set => 
            set.weight !== null && set.weight > 0 && 
            set.reps !== null && set.reps > 0
          );

          if (completedSets.length >= exercise.target_sets) {
            completedExercises++;
          }

          completedSets.forEach(set => {
            totalVolume += (set.weight || 0) * (set.reps || 0);
            if (set.rpe) {
              totalRpe += set.rpe;
              rpeCount++;
            }
          });
        });

        const completionPercentage = workoutExercises.length > 0 
          ? Math.round((completedExercises / workoutExercises.length) * 100) 
          : 0;

        const averageRpe = rpeCount > 0 ? totalRpe / rpeCount : undefined;

        return {
          ...workout,
          exercises: exercisesWithSets,
          completionPercentage,
          totalVolume,
          averageRpe,
        };
      });

      return {
        workouts: workoutHistoryItems,
        totalCount: count || 0,
        hasMore: (offset + limit) < (count || 0),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get workout statistics
 */
export const useWorkoutStats = (dateRange?: { start: string; end: string }) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workout-stats', user?.id, dateRange],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('workouts')
        .select('id, date, is_completed, duration_minutes')
        .eq('user_id', user.id);

      if (dateRange) {
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data: workouts, error } = await query;

      if (error) throw error;

      const totalWorkouts = workouts?.length || 0;
      const completedWorkouts = workouts?.filter(w => w.is_completed).length || 0;
      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
      
      const totalDuration = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
      const averageDuration = completedWorkouts > 0 ? totalDuration / completedWorkouts : 0;

      // Get current week stats
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const thisWeekWorkouts = workouts?.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
      }) || [];

      const thisWeekCompleted = thisWeekWorkouts.filter(w => w.is_completed).length;

      return {
        totalWorkouts,
        completedWorkouts,
        completionRate,
        averageDuration,
        thisWeekCompleted,
        thisWeekTotal: thisWeekWorkouts.length,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to update workout completion status
 */
export const useUpdateWorkoutCompletion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      isCompleted, 
      durationMinutes 
    }: { 
      workoutId: number; 
      isCompleted: boolean; 
      durationMinutes?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workouts')
        .update({
          is_completed: isCompleted,
          duration_minutes: durationMinutes,
        })
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['workout-history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workout-stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['today-workout'],
      });
      queryClient.invalidateQueries({
        queryKey: ['weekly-progress'],
      });
    },
    onError: (error) => {
      console.error('Failed to update workout completion:', error);
    },
  });
};