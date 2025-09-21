import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';
import type { Database } from '../../../types/database';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  exercises?: (Database['public']['Tables']['exercises']['Row'] & {
    sets?: Database['public']['Tables']['exercise_sets']['Row'][];
  })[];
};

export const useTodayWorkout = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['today-workout', user?.id],
    queryFn: async (): Promise<Workout | null> => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      // First, get today's workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (workoutError) {
        if (workoutError.code === 'PGRST116') {
          // No workout found for today
          return null;
        }
        throw workoutError;
      }

      if (!workout) return null;

      // Get exercises for this workout
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workout.id)
        .order('order_index');

      if (exercisesError) throw exercisesError;

      // Get sets for each exercise
      const exercisesWithSets = await Promise.all(
        (exercises || []).map(async (exercise) => {
          const { data: sets, error: setsError } = await supabase
            .from('exercise_sets')
            .select('*')
            .eq('exercise_id', exercise.id)
            .order('set_index');

          if (setsError) throw setsError;

          return {
            ...exercise,
            sets: sets || [],
          };
        })
      );

      return {
        ...workout,
        exercises: exercisesWithSets,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};