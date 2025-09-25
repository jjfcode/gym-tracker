import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWeightLogs,
  getWeightLogsByDateRange,
  getLatestWeightLog,
  getWeightLogByDate,
  createWeightLog,
  updateWeightLog,
  deleteWeightLog,
  upsertWeightLog,
} from '../services/weightService';
import type { WeightLog } from '../../../types/common';
import type { WeightLogFormData } from '../../../lib/validations/weight';

// Query keys
export const weightQueryKeys = {
  all: ['weight'] as const,
  logs: () => [...weightQueryKeys.all, 'logs'] as const,
  logsByDateRange: (startDate: string, endDate: string) => 
    [...weightQueryKeys.logs(), 'dateRange', startDate, endDate] as const,
  latest: () => [...weightQueryKeys.all, 'latest'] as const,
  byDate: (date: string) => [...weightQueryKeys.all, 'byDate', date] as const,
};

/**
 * Hook to get all weight logs
 */
export const useWeightLogs = () => {
  return useQuery({
    queryKey: weightQueryKeys.logs(),
    queryFn: getWeightLogs,
    staleTime: 0, // Always consider data stale to ensure fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes when not in use
  });
};

/**
 * Hook to get weight logs by date range
 */
export const useWeightLogsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: weightQueryKeys.logsByDateRange(startDate, endDate),
    queryFn: () => getWeightLogsByDateRange(startDate, endDate),
    enabled: Boolean(startDate && endDate),
    staleTime: 0, // Always consider data stale to ensure fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes when not in use
  });
};

/**
 * Hook to get the latest weight log
 */
export const useLatestWeightLog = () => {
  return useQuery({
    queryKey: weightQueryKeys.latest(),
    queryFn: getLatestWeightLog,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get weight log by specific date
 */
export const useWeightLogByDate = (date: string) => {
  return useQuery({
    queryKey: weightQueryKeys.byDate(date),
    queryFn: async () => {
      // Check if Supabase is configured
      if (!import.meta.env?.['VITE_SUPABASE_URL']) {
        // Demo mode - return null (no existing log)
        return null;
      }
      return getWeightLogByDate(date);
    },
    enabled: Boolean(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new weight log
 */
export const useCreateWeightLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WeightLogFormData) => createWeightLog({
      weight: data.weight,
      measured_at: data.measured_at,
      note: data.note || null,
    }),
    onSuccess: (newLog) => {
      // Invalidate and refetch weight logs
      queryClient.invalidateQueries({ queryKey: weightQueryKeys.all });
      
      // Optimistically update the logs cache
      queryClient.setQueryData<WeightLog[]>(weightQueryKeys.logs(), (old) => {
        if (!old) return [newLog];
        return [newLog, ...old.filter(log => log.measured_at !== newLog.measured_at)];
      });
    },
  });
};

/**
 * Hook to update an existing weight log
 */
export const useUpdateWeightLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WeightLogFormData> }) =>
      updateWeightLog(id, {
        ...(data.weight !== undefined && { weight: data.weight }),
        note: data.note || null,
      }),
    onSuccess: (updatedLog) => {
      // Invalidate and refetch weight logs
      queryClient.invalidateQueries({ queryKey: weightQueryKeys.all });
      
      // Optimistically update the logs cache
      queryClient.setQueryData<WeightLog[]>(weightQueryKeys.logs(), (old) => {
        if (!old) return [updatedLog];
        return old.map(log => log.id === updatedLog.id ? updatedLog : log);
      });
    },
  });
};

/**
 * Hook to delete a weight log
 */
export const useDeleteWeightLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWeightLog,
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch weight logs
      queryClient.invalidateQueries({ queryKey: weightQueryKeys.all });
      
      // Optimistically update the logs cache
      queryClient.setQueryData<WeightLog[]>(weightQueryKeys.logs(), (old) => {
        if (!old) return [];
        return old.filter(log => log.id !== deletedId);
      });
    },
  });
};

/**
 * Hook to upsert a weight log (create or update if exists)
 */
export const useUpsertWeightLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeightLogFormData) => {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env?.['VITE_SUPABASE_URL'];
      if (!supabaseUrl) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          id: Date.now(),
          user_id: 'demo-user',
          weight: data.weight,
          measured_at: data.measured_at,
          note: data.note || null,
          created_at: new Date().toISOString(),
        } as WeightLog;
      }
      
      return upsertWeightLog({
        weight: data.weight,
        measured_at: data.measured_at,
        note: data.note || null,
      });
    },
    onSuccess: (upsertedLog) => {
      console.log('Weight log upserted successfully:', upsertedLog);
      
      // Invalidate and refetch weight logs immediately
      queryClient.invalidateQueries({ 
        queryKey: weightQueryKeys.all,
        refetchType: 'all' // Force refetch of all queries
      });
      
      // Also invalidate any cached date range queries
      queryClient.invalidateQueries({ 
        queryKey: ['weight', 'logs', 'dateRange'],
        refetchType: 'all'
      });
      
      // Optimistically update the logs cache
      queryClient.setQueryData<WeightLog[]>(weightQueryKeys.logs(), (old) => {
        console.log('Updating cache with new weight log. Old data:', old?.length, 'entries');
        if (!old) return [upsertedLog];
        
        // Remove any existing log for the same date and add the new one
        const filtered = old.filter(log => log.measured_at !== upsertedLog.measured_at);
        const newData = [upsertedLog, ...filtered].sort((a, b) => 
          new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
        );
        console.log('New cache data:', newData.length, 'entries, latest:', newData[0]?.measured_at);
        return newData;
      });
    },
  });
};