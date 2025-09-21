import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';

interface PreviousPerformance {
  workout_date: string;
  best_weight: number;
  best_reps: number;
  best_rpe?: number;
  total_volume: number;
}

export const usePreviousPerformance = (exerciseSlug: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['previous-performance', exerciseSlug, user?.id],
    queryFn: async (): Promise<PreviousPerformance[]> => {
      if (!user) throw new Error('User not authenticated');

      // Get the last 5 workouts that included this exercise
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          id,
          workout_id,
          workouts!inner (
            date,
            is_completed
          )
        `)
        .eq('slug', exerciseSlug)
        .eq('user_id', user.id)
        .eq('workouts.is_completed', true)
        .order('workouts(date)', { ascending: false })
        .limit(5);

      if (exercisesError) throw exercisesError;

      if (!exercises || exercises.length === 0) {
        return [];
      }

      // Get performance data for each exercise
      const performanceData = await Promise.all(
        exercises.map(async (exercise) => {
          const { data: sets, error: setsError } = await supabase
            .from('exercise_sets')
            .select('weight, reps, rpe')
            .eq('exercise_id', exercise.id)
            .eq('user_id', user.id)
            .not('weight', 'is', null)
            .not('reps', 'is', null);

          if (setsError) throw setsError;

          if (!sets || sets.length === 0) {
            return null;
          }

          // Find the best set (highest weight, then highest reps)
          const bestSet = sets.reduce((best, current) => {
            if (!best) return current;
            
            if (current.weight! > best.weight!) return current;
            if (current.weight === best.weight && current.reps! > best.reps!) return current;
            
            return best;
          });

          // Calculate total volume
          const totalVolume = sets.reduce((sum, set) => {
            return sum + (set.weight! * set.reps!);
          }, 0);

          return {
            workout_date: (exercise as any).workouts.date,
            best_weight: bestSet.weight!,
            best_reps: bestSet.reps!,
            best_rpe: bestSet.rpe || undefined,
            total_volume: totalVolume,
          };
        })
      );

      return performanceData.filter(Boolean) as PreviousPerformance[];
    },
    enabled: !!user && !!exerciseSlug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};