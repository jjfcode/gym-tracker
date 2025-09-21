import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';

interface WeeklyProgress {
  completedWorkouts: number;
  totalWorkouts: number;
  totalVolume: number;
  averageRpe?: number;
}

export const useWeeklyProgress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['weekly-progress', user?.id],
    queryFn: async (): Promise<WeeklyProgress> => {
      if (!user) throw new Error('User not authenticated');

      // Get start and end of current week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
      
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // Get all workouts for this week
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id, is_completed')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (workoutsError) throw workoutsError;

      const totalWorkouts = workouts?.length || 0;
      const completedWorkouts = workouts?.filter(w => w.is_completed).length || 0;

      // Calculate total volume for completed workouts
      let totalVolume = 0;
      let totalRpeSum = 0;
      let rpeCount = 0;

      if (completedWorkouts > 0) {
        const completedWorkoutIds = workouts
          ?.filter(w => w.is_completed)
          .map(w => w.id) || [];

        if (completedWorkoutIds.length > 0) {
          // Get all exercises for completed workouts
          const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('id')
            .in('workout_id', completedWorkoutIds);

          if (exercisesError) throw exercisesError;

          if (exercises && exercises.length > 0) {
            const exerciseIds = exercises.map(e => e.id);

            // Get all sets for these exercises
            const { data: sets, error: setsError } = await supabase
              .from('exercise_sets')
              .select('weight, reps, rpe')
              .in('exercise_id', exerciseIds)
              .not('weight', 'is', null)
              .not('reps', 'is', null);

            if (setsError) throw setsError;

            // Calculate volume and average RPE
            sets?.forEach(set => {
              if (set.weight && set.reps) {
                totalVolume += set.weight * set.reps;
              }
              if (set.rpe) {
                totalRpeSum += set.rpe;
                rpeCount++;
              }
            });
          }
        }
      }

      const averageRpe = rpeCount > 0 ? totalRpeSum / rpeCount : undefined;

      return {
        completedWorkouts,
        totalWorkouts,
        totalVolume,
        averageRpe,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};