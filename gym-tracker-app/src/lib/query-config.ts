import { QueryClient } from '@tanstack/react-query';

// Query key factories for consistent cache management
export const queryKeys = {
  // User data
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  
  // Workouts
  workouts: ['workouts'] as const,
  workout: (id: string) => ['workouts', id] as const,
  todayWorkout: (userId: string, date: string) => ['workouts', 'today', userId, date] as const,
  workoutHistory: (userId: string) => ['workouts', 'history', userId] as const,
  
  // Exercises
  exercises: ['exercises'] as const,
  exercise: (id: string) => ['exercises', id] as const,
  exerciseLibrary: ['exercises', 'library'] as const,
  customExercises: (userId: string) => ['exercises', 'custom', userId] as const,
  
  // Progress
  progress: ['progress'] as const,
  weightLogs: (userId: string) => ['progress', 'weight', userId] as const,
  progressStats: (userId: string) => ['progress', 'stats', userId] as const,
  
  // Planning
  planning: ['planning'] as const,
  weeklyPlan: (userId: string, week: string) => ['planning', 'weekly', userId, week] as const,
  monthlyPlan: (userId: string, month: string) => ['planning', 'monthly', userId, month] as const,
  
  // Settings
  settings: ['settings'] as const,
  userSettings: (userId: string) => ['settings', userId] as const,
} as const;

// Cache time configurations for different data types
export const cacheConfig = {
  // Static data - cache for longer periods
  exerciseLibrary: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
  
  // User settings - medium cache time
  userSettings: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  
  // Workout data - shorter cache time for freshness
  workouts: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  
  // Today's workout - very short cache time
  todayWorkout: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  
  // Progress data - medium cache time
  progress: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  
  // Planning data - medium cache time
  planning: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
} as const;

// Prefetch strategies for common data
export const prefetchStrategies = {
  // Prefetch today's workout when user logs in
  prefetchTodayWorkout: async (queryClient: QueryClient, userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    await queryClient.prefetchQuery({
      queryKey: queryKeys.todayWorkout(userId, today),
      queryFn: () => import('../lib/workout-utils').then(m => m.getTodayWorkout(userId, today)),
      ...cacheConfig.todayWorkout,
    });
  },
  
  // Prefetch exercise library on app start
  prefetchExerciseLibrary: async (queryClient: QueryClient) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.exerciseLibrary,
      queryFn: () => import('../lib/exercise-library').then(m => m.getExerciseLibrary()),
      ...cacheConfig.exerciseLibrary,
    });
  },
  
  // Prefetch user settings
  prefetchUserSettings: async (queryClient: QueryClient, userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userSettings(userId),
      queryFn: () => import('../lib/supabase').then(m => m.getUserSettings(userId)),
      ...cacheConfig.userSettings,
    });
  },
} as const;

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate all workout-related queries
  invalidateWorkouts: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
  },
  
  // Invalidate progress data
  invalidateProgress: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.weightLogs(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.progressStats(userId) });
  },
  
  // Invalidate planning data
  invalidatePlanning: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.planning });
  },
  
  // Clear all user data on logout
  clearUserData: (queryClient: QueryClient) => {
    queryClient.removeQueries({ queryKey: queryKeys.user });
    queryClient.removeQueries({ queryKey: queryKeys.workouts });
    queryClient.removeQueries({ queryKey: queryKeys.progress });
    queryClient.removeQueries({ queryKey: queryKeys.planning });
    queryClient.removeQueries({ queryKey: queryKeys.settings });
  },
} as const;