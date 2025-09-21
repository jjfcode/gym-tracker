import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';
import type { Database } from '../../../types/database';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

interface UpdateSetParams {
  setId?: number;
  exerciseId?: number;
  setIndex?: number;
  updates: Partial<ExerciseSet>;
}

export const useUpdateExerciseSet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ setId, exerciseId, setIndex, updates }: UpdateSetParams) => {
      if (!user) throw new Error('User not authenticated');

      if (setId) {
        // Update existing set
        const { data, error } = await supabase
          .from('exercise_sets')
          .update({
            ...updates,
            user_id: user.id,
          })
          .eq('id', setId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else if (exerciseId && setIndex !== undefined) {
        // Create new set
        const { data, error } = await supabase
          .from('exercise_sets')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            set_index: setIndex,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        throw new Error('Either setId or both exerciseId and setIndex must be provided');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch exercise sets
      queryClient.invalidateQueries({
        queryKey: ['exercise-sets', data.exercise_id],
      });
      
      // Invalidate today's workout to update progress
      queryClient.invalidateQueries({
        queryKey: ['today-workout'],
      });
      
      // Invalidate weekly progress
      queryClient.invalidateQueries({
        queryKey: ['weekly-progress'],
      });
    },
    onError: (error) => {
      console.error('Failed to update exercise set:', error);
    },
  });
};