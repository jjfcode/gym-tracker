import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth';
import { ExerciseSetService } from '../services/exerciseSetService';
import { validateExerciseSet } from '../../../lib/validations/workout';
import type { Database } from '../../../types/database';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

interface UpdateSetParams {
  setId?: number;
  exerciseId?: number;
  setIndex?: number;
  updates: Partial<ExerciseSet>;
  optimistic?: boolean;
}

export const useUpdateExerciseSet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ setId, exerciseId, setIndex, updates }: UpdateSetParams) => {
      if (!user) throw new Error('User not authenticated');

      // Validate the updates
      const validation = validateExerciseSet(updates);
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
      }

      if (setId) {
        // Update existing set
        return ExerciseSetService.updateSet(user.id, {
          setId,
          weight: updates.weight,
          reps: updates.reps,
          rpe: updates.rpe,
          notes: updates.notes,
        });
      } else if (exerciseId && setIndex !== undefined) {
        // Create new set
        return ExerciseSetService.createSet(user.id, {
          exerciseId,
          setIndex,
          weight: updates.weight,
          reps: updates.reps,
          rpe: updates.rpe,
          notes: updates.notes,
        });
      } else {
        throw new Error('Either setId or both exerciseId and setIndex must be provided');
      }
    },
    onMutate: async ({ setId, exerciseId, setIndex, updates, optimistic = true }) => {
      if (!optimistic || !user) return;

      const targetExerciseId = exerciseId || (setId ? undefined : exerciseId);
      if (!targetExerciseId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['exercise-sets', targetExerciseId],
      });

      // Snapshot the previous value
      const previousSets = queryClient.getQueryData<ExerciseSet[]>([
        'exercise-sets',
        targetExerciseId,
        user.id,
      ]);

      // Optimistically update the cache
      if (previousSets) {
        const optimisticSets = [...previousSets];
        
        if (setId) {
          // Update existing set
          const setIndex = optimisticSets.findIndex(set => set.id === setId);
          if (setIndex !== -1) {
            optimisticSets[setIndex] = {
              ...optimisticSets[setIndex],
              ...updates,
            };
          }
        } else if (setIndex !== undefined) {
          // Add new set or update existing by set_index
          const existingIndex = optimisticSets.findIndex(set => set.set_index === setIndex);
          if (existingIndex !== -1) {
            optimisticSets[existingIndex] = {
              ...optimisticSets[existingIndex],
              ...updates,
            };
          } else {
            // Create optimistic new set
            const newSet: ExerciseSet = {
              id: Date.now(), // Temporary ID
              user_id: user.id,
              exercise_id: targetExerciseId,
              set_index: setIndex,
              weight: updates.weight || null,
              reps: updates.reps || null,
              rpe: updates.rpe || null,
              notes: updates.notes || null,
              created_at: new Date().toISOString(),
            };
            optimisticSets.push(newSet);
            optimisticSets.sort((a, b) => a.set_index - b.set_index);
          }
        }

        queryClient.setQueryData(
          ['exercise-sets', targetExerciseId, user.id],
          optimisticSets
        );
      }

      // Return a context object with the snapshotted value
      return { previousSets, targetExerciseId };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSets && context?.targetExerciseId) {
        queryClient.setQueryData(
          ['exercise-sets', context.targetExerciseId, user?.id],
          context.previousSets
        );
      }
      console.error('Failed to update exercise set:', error);
    },
    onSuccess: (data) => {
      // Invalidate and refetch exercise sets to ensure consistency
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

      // Invalidate exercise progress
      queryClient.invalidateQueries({
        queryKey: ['exercise-progress'],
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: ['exercise-sets'],
      });
    },
  });
};