import { supabase } from '../../../lib/supabase';
import type { WeightLog } from '../../../types/common';
import type { Database } from '../../../types/database';

type WeightLogInsert = Database['public']['Tables']['weight_logs']['Insert'];
type WeightLogUpdate = Database['public']['Tables']['weight_logs']['Update'];

/**
 * Create a new weight log entry
 */
export const createWeightLog = async (weightLog: Omit<WeightLogInsert, 'user_id'>): Promise<WeightLog> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .insert({
      ...weightLog,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create weight log: ${error.message}`);
  }

  return data as WeightLog;
};

/**
 * Update an existing weight log entry
 */
export const updateWeightLog = async (id: number, updates: WeightLogUpdate): Promise<WeightLog> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update weight log: ${error.message}`);
  }

  return data as WeightLog;
};

/**
 * Delete a weight log entry
 */
export const deleteWeightLog = async (id: number): Promise<void> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete weight log: ${error.message}`);
  }
};

/**
 * Get all weight logs for the current user
 */
export const getWeightLogs = async (): Promise<WeightLog[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch weight logs: ${error.message}`);
  }

  return data as WeightLog[];
};

/**
 * Get weight logs within a date range
 */
export const getWeightLogsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<WeightLog[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('measured_at', startDate)
    .lte('measured_at', endDate)
    .order('measured_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weight logs: ${error.message}`);
  }

  return data as WeightLog[];
};

/**
 * Get the most recent weight log
 */
export const getLatestWeightLog = async (): Promise<WeightLog | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null;
    }
    throw new Error(`Failed to fetch latest weight log: ${error.message}`);
  }

  return data as WeightLog;
};

/**
 * Get weight log for a specific date
 */
export const getWeightLogByDate = async (date: string): Promise<WeightLog | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('measured_at', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null;
    }
    throw new Error(`Failed to fetch weight log: ${error.message}`);
  }

  return data as WeightLog;
};

/**
 * Upsert weight log (create or update if exists for the date)
 */
export const upsertWeightLog = async (weightLog: Omit<WeightLogInsert, 'user_id'>): Promise<WeightLog> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Check if a weight log already exists for this date
  const existingLog = await getWeightLogByDate(weightLog.measured_at);

  if (existingLog) {
    // Update existing log
    return updateWeightLog(existingLog.id, {
      weight: weightLog.weight,
      note: weightLog.note,
    });
  } else {
    // Create new log
    return createWeightLog(weightLog);
  }
};