import { supabase } from './supabase';
import { handleError, handleSupabaseError, handleAuthError, AppError } from './error-handling';
import { retrySupabaseOperation, RETRY_PRESETS } from './retry-utils';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Enhanced Supabase client wrapper with error handling and retry logic
 */

export interface SupabaseResponse<T> {
  data: T | null;
  error: AppError | null;
  success: boolean;
}

export interface SupabaseListResponse<T> extends SupabaseResponse<T[]> {
  count?: number;
}

/**
 * Generic database operation wrapper
 */
async function executeOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  useRetry = true
): Promise<SupabaseResponse<T>> {
  try {
    if (useRetry) {
      const result = await retrySupabaseOperation(operation, RETRY_PRESETS.STANDARD);
      return {
        data: result.data,
        error: result.error,
        success: result.error === null,
      };
    } else {
      const { data, error } = await operation();
      if (error) {
        const appError = handleSupabaseError(error);
        return {
          data: null,
          error: appError,
          success: false,
        };
      }
      return {
        data,
        error: null,
        success: true,
      };
    }
  } catch (error) {
    const appError = handleError(error);
    return {
      data: null,
      error: appError,
      success: false,
    };
  }
}

/**
 * Authentication operations
 */
export const authClient = {
  async signUp(email: string, password: string, options?: { data?: Record<string, any> }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        return {
          data: null,
          error: handleAuthError(error),
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
        success: false,
      };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error: handleAuthError(error),
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
        success: false,
      };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          error: handleAuthError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error: handleError(error),
        success: false,
      };
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          error: handleAuthError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error: handleError(error),
        success: false,
      };
    }
  },

  async updatePassword(password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          data: null,
          error: handleAuthError(error),
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
        success: false,
      };
    }
  },

  getCurrentUser() {
    return supabase.auth.getUser();
  },

  getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

/**
 * Database operations
 */
export const dbClient = {
  // Profile operations
  profile: {
    async get(userId: string) {
      return executeOperation(() =>
        supabase
          .from('profile')
          .select('*')
          .eq('user_id', userId)
          .single()
      );
    },

    async create(profile: any) {
      return executeOperation(() =>
        supabase
          .from('profile')
          .insert(profile)
          .select()
          .single()
      );
    },

    async update(userId: string, updates: any) {
      return executeOperation(() =>
        supabase
          .from('profile')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single()
      );
    },
  },

  // Weight logs operations
  weightLogs: {
    async list(userId: string, limit = 50) {
      return executeOperation(() =>
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(limit)
      );
    },

    async create(weightLog: any) {
      return executeOperation(() =>
        supabase
          .from('weight_logs')
          .insert(weightLog)
          .select()
          .single()
      );
    },

    async update(id: number, updates: any) {
      return executeOperation(() =>
        supabase
          .from('weight_logs')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );
    },

    async delete(id: number) {
      return executeOperation(() =>
        supabase
          .from('weight_logs')
          .delete()
          .eq('id', id)
      );
    },

    async getByDate(userId: string, date: string) {
      return executeOperation(() =>
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('measured_at', date)
          .single()
      );
    },
  },

  // Workout operations
  workouts: {
    async list(userId: string, startDate?: string, endDate?: string) {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          exercises (
            *,
            exercise_sets (*)
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      return executeOperation(() => query);
    },

    async get(id: number) {
      return executeOperation(() =>
        supabase
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          `)
          .eq('id', id)
          .single()
      );
    },

    async getByDate(userId: string, date: string) {
      return executeOperation(() =>
        supabase
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          `)
          .eq('user_id', userId)
          .eq('date', date)
          .single()
      );
    },

    async create(workout: any) {
      return executeOperation(() =>
        supabase
          .from('workouts')
          .insert(workout)
          .select()
          .single()
      );
    },

    async update(id: number, updates: any) {
      return executeOperation(() =>
        supabase
          .from('workouts')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );
    },

    async delete(id: number) {
      return executeOperation(() =>
        supabase
          .from('workouts')
          .delete()
          .eq('id', id)
      );
    },
  },

  // Exercise operations
  exercises: {
    async create(exercise: any) {
      return executeOperation(() =>
        supabase
          .from('exercises')
          .insert(exercise)
          .select()
          .single()
      );
    },

    async update(id: number, updates: any) {
      return executeOperation(() =>
        supabase
          .from('exercises')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );
    },

    async delete(id: number) {
      return executeOperation(() =>
        supabase
          .from('exercises')
          .delete()
          .eq('id', id)
      );
    },
  },

  // Exercise sets operations
  exerciseSets: {
    async create(set: any) {
      return executeOperation(() =>
        supabase
          .from('exercise_sets')
          .insert(set)
          .select()
          .single()
      );
    },

    async update(id: number, updates: any) {
      return executeOperation(() =>
        supabase
          .from('exercise_sets')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );
    },

    async delete(id: number) {
      return executeOperation(() =>
        supabase
          .from('exercise_sets')
          .delete()
          .eq('id', id)
      );
    },

    async bulkUpdate(sets: Array<{ id: number; updates: any }>) {
      const operations = sets.map(({ id, updates }) =>
        supabase
          .from('exercise_sets')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );

      try {
        const results = await Promise.all(operations);
        const errors = results.filter(result => result.error);
        
        if (errors.length > 0) {
          return {
            data: null,
            error: handleSupabaseError(errors[0].error),
            success: false,
          };
        }

        return {
          data: results.map(result => result.data),
          error: null,
          success: true,
        };
      } catch (error) {
        return {
          data: null,
          error: handleError(error),
          success: false,
        };
      }
    },
  },

  // Plans operations
  plans: {
    async get(userId: string) {
      return executeOperation(() =>
        supabase
          .from('plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      );
    },

    async create(plan: any) {
      return executeOperation(() =>
        supabase
          .from('plans')
          .insert(plan)
          .select()
          .single()
      );
    },

    async update(id: number, updates: any) {
      return executeOperation(() =>
        supabase
          .from('plans')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );
    },
  },
};

/**
 * Real-time subscriptions with error handling
 */
export const realtimeClient = {
  subscribeToWorkouts(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('workouts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Real-time callback error:', handleError(error));
          }
        }
      )
      .subscribe();
  },

  subscribeToWeightLogs(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('weight_logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Real-time callback error:', handleError(error));
          }
        }
      )
      .subscribe();
  },
};

// Export the original supabase client for direct access when needed
export { supabase };