import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';
import { ExerciseSetService, type SetProgress } from '../services/exerciseSetService';

/**
 * Hook to get progress for a single exercise
 */
export const useExerciseProgress = (exerciseId: number, targetSets: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exercise-progress', exerciseId, user?.id],
    queryFn: async (): Promise<SetProgress> => {
      if (!user) throw new Error('User not authenticated');

      const sets = await ExerciseSetService.getExerciseSets(user.id, exerciseId);
      return ExerciseSetService.calculateExerciseProgress(sets, targetSets);
    },
    enabled: !!user && !!exerciseId,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get progress for multiple exercises
 */
export const useExerciseProgressBatch = (exerciseIds: number[]) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exercise-progress-batch', exerciseIds, user?.id],
    queryFn: async (): Promise<Map<number, SetProgress>> => {
      if (!user) throw new Error('User not authenticated');

      return ExerciseSetService.getExerciseProgressBatch(user.id, exerciseIds);
    },
    enabled: !!user && exerciseIds.length > 0,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to calculate workout completion percentage
 */
export const useWorkoutProgress = (workoutId: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workout-progress', workoutId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get all exercises for this workout
      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('id, target_sets')
        .eq('workout_id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!exercises || exercises.length === 0) {
        return {
          completedExercises: 0,
          totalExercises: 0,
          completionPercentage: 0,
          totalVolume: 0,
          averageRpe: 0,
        };
      }

      // Get progress for all exercises
      const exerciseIds = exercises.map(ex => ex.id);
      const progressMap = await ExerciseSetService.getExerciseProgressBatch(user.id, exerciseIds);

      let completedExercises = 0;
      let totalVolume = 0;
      let totalRpe = 0;
      let rpeCount = 0;

      progressMap.forEach((progress) => {
        if (progress.isCompleted) {
          completedExercises++;
        }
        totalVolume += progress.totalVolume;
        if (progress.averageRpe) {
          totalRpe += progress.averageRpe;
          rpeCount++;
        }
      });

      const completionPercentage = exercises.length > 0 
        ? Math.round((completedExercises / exercises.length) * 100) 
        : 0;

      const averageRpe = rpeCount > 0 ? totalRpe / rpeCount : 0;

      return {
        completedExercises,
        totalExercises: exercises.length,
        completionPercentage,
        totalVolume,
        averageRpe,
        exerciseProgress: progressMap,
      };
    },
    enabled: !!user && !!workoutId,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
};