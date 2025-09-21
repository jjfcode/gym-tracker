import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';

interface LogWeightParams {
  weight: number;
  measured_at: string;
  note?: string;
}

export const useLogWeight = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weight, measured_at, note }: LogWeightParams) => {
      if (!user) throw new Error('User not authenticated');

      // Use upsert to handle duplicate dates
      const { data, error } = await supabase
        .from('weight_logs')
        .upsert({
          user_id: user.id,
          weight,
          measured_at,
          note: note || null,
        }, {
          onConflict: 'user_id,measured_at',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate weight-related queries
      queryClient.invalidateQueries({
        queryKey: ['weight-logs'],
      });
      
      // Could also invalidate progress queries if they include weight data
      queryClient.invalidateQueries({
        queryKey: ['weekly-progress'],
      });
    },
    onError: (error) => {
      console.error('Failed to log weight:', error);
    },
  });
};