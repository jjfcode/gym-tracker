import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkoutsForDateRange,
  getWorkoutPreview,
  rescheduleWorkout,
  createWorkoutForDate,
  deleteWorkout,
  markWorkoutCompleted,
  getWorkoutStats,
} from '../services/calendarService';
import type { RescheduleWorkoutData } from '../types';

// Query keys
export const calendarQueryKeys = {
  all: ['calendar'] as const,
  workouts: () => [...calendarQueryKeys.all, 'workouts'] as const,
  workoutsByDateRange: (startDate: string, endDate: string) => 
    [...calendarQueryKeys.workouts(), 'dateRange', startDate, endDate] as const,
  workoutPreview: (workoutId: number) => 
    [...calendarQueryKeys.all, 'preview', workoutId] as const,
  workoutStats: (startDate: string, endDate: string) => 
    [...calendarQueryKeys.all, 'stats', startDate, endDate] as const,
};

/**
 * Hook to get workouts for a date range (used by calendar views)
 */
export const useWorkoutsForDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: calendarQueryKeys.workoutsByDateRange(startDate, endDate),
    queryFn: async () => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - return mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateMockWorkouts(startDate, endDate);
      }
      return getWorkoutsForDateRange(startDate, endDate);
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get workout preview data
 */
export const useWorkoutPreview = (workoutId: number | null) => {
  return useQuery({
    queryKey: calendarQueryKeys.workoutPreview(workoutId!),
    queryFn: async () => {
      if (!workoutId) return null;
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - return mock data
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateMockWorkoutPreview(workoutId);
      }
      return getWorkoutPreview(workoutId);
    },
    enabled: Boolean(workoutId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get workout statistics for a date range
 */
export const useWorkoutStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: calendarQueryKeys.workoutStats(startDate, endDate),
    queryFn: async () => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - return mock stats
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
          totalWorkouts: 12,
          completedWorkouts: 9,
          completionRate: 75,
          totalDuration: 540,
          averageDuration: 60,
        };
      }
      return getWorkoutStats(startDate, endDate);
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to reschedule a workout
 */
export const useRescheduleWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RescheduleWorkoutData) => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      return rescheduleWorkout(data);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refetch data
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.workouts() });
    },
  });
};

/**
 * Hook to create a new workout
 */
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, title, exercises }: { 
      date: string; 
      title: string; 
      exercises?: any[] 
    }) => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return Date.now(); // Return mock workout ID
      }
      return createWorkoutForDate(date, title, exercises);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refetch data
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.workouts() });
    },
  });
};

/**
 * Hook to delete a workout
 */
export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId: number) => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }
      return deleteWorkout(workoutId);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refetch data
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.workouts() });
    },
  });
};

/**
 * Hook to mark workout as completed
 */
export const useMarkWorkoutCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId: number) => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }
      return markWorkoutCompleted(workoutId);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refetch data
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.workouts() });
    },
  });
};

// Demo mode helper functions
const generateMockWorkouts = (startDate: string, endDate: string) => {
  const workouts: Record<string, any> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const workoutTitles = [
    'Upper Body Strength',
    'Lower Body Power',
    'Full Body Circuit',
    'Push Day',
    'Pull Day',
    'Leg Day',
    'Cardio & Core',
  ];
  
  let currentDate = new Date(start);
  let workoutIndex = 0;
  
  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    
    // Skip some days to simulate rest days
    if (dayOfWeek !== 0 && dayOfWeek !== 3 && Math.random() > 0.2) {
      const isCompleted = Math.random() > 0.3;
      const exerciseCount = Math.floor(Math.random() * 6) + 4;
      
      workouts[dateString] = {
        id: workoutIndex + 1,
        title: workoutTitles[workoutIndex % workoutTitles.length],
        is_completed: isCompleted,
        exercise_count: exerciseCount,
        duration_minutes: isCompleted ? Math.floor(Math.random() * 30) + 45 : undefined,
        completion_rate: isCompleted ? 100 : Math.floor(Math.random() * 60) + 20,
      };
      
      workoutIndex++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workouts;
};

const generateMockWorkoutPreview = (workoutId: number) => {
  const exercises = [
    { slug: 'bench-press', name_en: 'Bench Press', name_es: 'Press de Banca' },
    { slug: 'squat', name_en: 'Squat', name_es: 'Sentadilla' },
    { slug: 'deadlift', name_en: 'Deadlift', name_es: 'Peso Muerto' },
    { slug: 'pull-ups', name_en: 'Pull-ups', name_es: 'Dominadas' },
    { slug: 'overhead-press', name_en: 'Overhead Press', name_es: 'Press Militar' },
  ];
  
  const selectedExercises = exercises.slice(0, Math.floor(Math.random() * 3) + 3);
  
  return {
    id: workoutId,
    title: 'Upper Body Strength',
    date: new Date().toISOString().split('T')[0],
    is_completed: Math.random() > 0.5,
    duration_minutes: Math.floor(Math.random() * 30) + 45,
    exercises: selectedExercises.map((exercise, index) => ({
      id: index + 1,
      name_en: exercise.name_en,
      name_es: exercise.name_es,
      target_sets: 3,
      target_reps: Math.floor(Math.random() * 5) + 8,
      completed_sets: Math.floor(Math.random() * 4),
    })),
    notes: 'Focus on form and controlled movements',
  };
};