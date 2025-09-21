import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';
import type { Database } from '../../../types/database';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

export const useExerciseSets = (exerciseId: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exercise-sets', exerciseId, user?.id],
    queryFn: async (): Promise<ExerciseSet[]> => {
      if (!user) throw new Error('User not authenticated');

      const { data: sets, error } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .order('set_index');

      if (error) throw error;

      return sets || [];
    },
    enabled: !!user && !!exerciseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};