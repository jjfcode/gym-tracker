import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth';
import { ExerciseService } from '../services/exerciseService';
import type { CustomExercise } from '../types';

export function useCustomExercises() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: customExercises = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['custom-exercises', user?.id],
    queryFn: () => ExerciseService.getCustomExercises(user!.id),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (exercise: Omit<CustomExercise, 'id' | 'created_at' | 'updated_at'>) =>
      ExerciseService.createCustomExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<CustomExercise> }) =>
      ExerciseService.updateCustomExercise(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ExerciseService.deleteCustomExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  return {
    customExercises,
    isLoading,
    error,
    createCustomExercise: createMutation.mutate,
    updateCustomExercise: updateMutation.mutate,
    deleteCustomExercise: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCustomExercise(id: number) {
  return useQuery({
    queryKey: ['custom-exercise', id],
    queryFn: () => ExerciseService.getCustomExerciseById(id),
    enabled: !!id,
  });
}

export function useWorkoutExerciseModification(workoutId: number) {
  const queryClient = useQueryClient();

  const reorderMutation = useMutation({
    mutationFn: (exerciseOrders: { id: number; order_index: number }[]) =>
      ExerciseService.reorderWorkoutExercises(workoutId, exerciseOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ exerciseId, updates }: {
      exerciseId: number;
      updates: { target_sets?: number; target_reps?: number; order_index?: number };
    }) => ExerciseService.updateWorkoutExercise(exerciseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (exerciseId: number) => ExerciseService.removeWorkoutExercise(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (exercise: {
      slug: string;
      name_en: string;
      name_es: string;
      target_sets: number;
      target_reps: number;
      order_index: number;
      machine_brand?: string;
    }) => ExerciseService.addExerciseToWorkout(workoutId, exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  return {
    reorderExercises: reorderMutation.mutate,
    updateExercise: updateMutation.mutate,
    removeExercise: removeMutation.mutate,
    addExercise: addMutation.mutate,
    isReordering: reorderMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isAdding: addMutation.isPending,
  };
}