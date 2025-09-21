import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';

export const useCompleteWorkout = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workoutId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workouts')
        .update({
          is_completed: true,
          duration_minutes: null, // Could be calculated based on start/end times
        })
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate today's workout
      queryClient.invalidateQueries({
        queryKey: ['today-workout'],
      });
      
      // Invalidate weekly progress
      queryClient.invalidateQueries({
        queryKey: ['weekly-progress'],
      });
    },
    onError: (error) => {
      console.error('Failed to complete workout:', error);
    },
  });
};