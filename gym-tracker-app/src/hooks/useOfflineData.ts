import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from '../lib/offline-storage';
import { syncService } from '../lib/sync-service';
import { supabase } from '../lib/supabase';
import type { Workout, Exercise, ExerciseSet, WeightLog } from '../types';

// Workout hooks
export function useOfflineWorkout(date: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['workout', date],
    queryFn: async (): Promise<Workout | null> => {
      // Try offline first
      const offlineWorkout = await offlineStorage.getWorkout(date);
      if (offlineWorkout) {
        return offlineWorkout;
      }

      // If online, try to fetch from server
      if (navigator.onLine) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          `)
          .eq('user_id', user.id)
          .eq('date', date)
          .single();

        if (data) {
          // Cache in offline storage
          await offlineStorage.saveWorkout(data as Workout);
          return data as Workout;
        }
      }

      return null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useOfflineWorkouts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['workouts', startDate, endDate],
    queryFn: async (): Promise<Workout[]> => {
      // Try offline first
      const offlineWorkouts = await offlineStorage.getWorkouts(startDate, endDate);
      if (offlineWorkouts.length > 0 || !navigator.onLine) {
        return offlineWorkouts;
      }

      // If online and no offline data, fetch from server
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('workouts')
        .select(`
          *,
          exercises (
            *,
            exercise_sets (*)
          )
        `)
        .eq('user_id', user.id);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data } = await query;

      if (data) {
        // Cache in offline storage
        for (const workout of data) {
          await offlineStorage.saveWorkout(workout as Workout);
        }
        return data as Workout[];
      }

      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: Workout) => {
      // Always save to offline storage first
      await offlineStorage.saveWorkout(workout);

      // If online, try to sync to server
      if (navigator.onLine) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('workouts')
            .upsert({ ...workout, user_id: user.id });

          if (error) {
            console.error('Failed to sync workout to server:', error);
            // Don't throw error, data is saved offline
          }
        }
      }

      return workout;
    },
    onSuccess: (workout) => {
      // Update cache
      queryClient.setQueryData(['workout', workout.date], workout);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

// Exercise Set hooks
export function useOfflineExerciseSets(exerciseId: number) {
  return useQuery({
    queryKey: ['exerciseSets', exerciseId],
    queryFn: async (): Promise<ExerciseSet[]> => {
      // Try offline first
      const offlineSets = await offlineStorage.getExerciseSets(exerciseId);
      if (offlineSets.length > 0 || !navigator.onLine) {
        return offlineSets;
      }

      // If online and no offline data, fetch from server
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId);

      if (data) {
        // Cache in offline storage
        for (const set of data) {
          await offlineStorage.saveExerciseSet(set as ExerciseSet);
        }
        return data as ExerciseSet[];
      }

      return [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSaveExerciseSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (set: ExerciseSet) => {
      // Always save to offline storage first
      await offlineStorage.saveExerciseSet(set);

      // If online, try to sync to server
      if (navigator.onLine) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('exercise_sets')
            .upsert({ ...set, user_id: user.id });

          if (error) {
            console.error('Failed to sync exercise set to server:', error);
          }
        }
      }

      return set;
    },
    onSuccess: (set) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['exerciseSets', set.exercise_id] });
    },
  });
}

// Weight Log hooks
export function useOfflineWeightLogs(limit?: number) {
  return useQuery({
    queryKey: ['weightLogs', limit],
    queryFn: async (): Promise<WeightLog[]> => {
      // Try offline first
      const offlineLogs = await offlineStorage.getWeightLogs(limit);
      if (offlineLogs.length > 0 || !navigator.onLine) {
        return offlineLogs;
      }

      // If online and no offline data, fetch from server
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data } = await query;

      if (data) {
        // Cache in offline storage
        for (const log of data) {
          await offlineStorage.saveWeightLog(log as WeightLog);
        }
        return data as WeightLog[];
      }

      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weightLog: WeightLog) => {
      // Always save to offline storage first
      await offlineStorage.saveWeightLog(weightLog);

      // If online, try to sync to server
      if (navigator.onLine) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('weight_logs')
            .upsert({ ...weightLog, user_id: user.id });

          if (error) {
            console.error('Failed to sync weight log to server:', error);
          }
        }
      }

      return weightLog;
    },
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
    },
  });
}

// Sync status hook
export function useSyncStatus() {
  const [status, setStatus] = useState<'syncing' | 'synced' | 'error' | 'idle'>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribeSync = syncService.onSyncStatusChange(setStatus);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const forcSync = useCallback(async () => {
    await syncService.forcSync();
  }, []);

  return {
    status,
    isOnline,
    forcSync,
  };
}