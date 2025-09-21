import { supabase } from './supabase';

// Database optimization utilities and query builders
export class DatabaseOptimizer {
  
  // Optimized query for today's workout with minimal data transfer
  static async getTodayWorkoutOptimized(userId: string, date: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id,
        title,
        is_completed,
        exercises!inner(
          id,
          slug,
          name_en,
          name_es,
          target_sets,
          target_reps,
          order_index,
          exercise_sets(
            id,
            set_index,
            weight,
            reps,
            rpe,
            notes
          )
        )
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .order('order_index', { foreignTable: 'exercises' })
      .order('set_index', { foreignTable: 'exercises.exercise_sets' })
      .single();

    return { data, error };
  }

  // Optimized query for workout history with pagination
  static async getWorkoutHistoryOptimized(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id,
        date,
        title,
        is_completed,
        duration_minutes,
        exercises(count)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  }

  // Optimized query for progress data with aggregations
  static async getProgressStatsOptimized(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .rpc('get_progress_stats', {
        user_id: userId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });

    return { data, error };
  }

  // Optimized query for weight logs with trend calculation
  static async getWeightLogsOptimized(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('measured_at, weight, note')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  // Batch insert for exercise sets (more efficient than individual inserts)
  static async batchInsertExerciseSets(sets: any[]) {
    const { data, error } = await supabase
      .from('exercise_sets')
      .insert(sets)
      .select();

    return { data, error };
  }

  // Batch update for exercise sets
  static async batchUpdateExerciseSets(updates: { id: number; [key: string]: any }[]) {
    const promises = updates.map(update => {
      const { id, ...updateData } = update;
      return supabase
        .from('exercise_sets')
        .update(updateData)
        .eq('id', id);
    });

    const results = await Promise.all(promises);
    return results;
  }

  // Optimized search for exercises with full-text search
  static async searchExercisesOptimized(query: string, limit: number = 20) {
    const { data, error } = await supabase
      .rpc('search_exercises', {
        search_query: query,
        result_limit: limit
      });

    return { data, error };
  }

  // Get exercise performance trends
  static async getExercisePerformanceTrends(
    userId: string, 
    exerciseSlug: string, 
    days: number = 90
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .rpc('get_exercise_performance_trends', {
        user_id: userId,
        exercise_slug: exerciseSlug,
        start_date: startDate.toISOString().split('T')[0]
      });

    return { data, error };
  }

  // Optimized calendar data query
  static async getCalendarDataOptimized(
    userId: string, 
    startDate: string, 
    endDate: string
  ) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        date,
        title,
        is_completed,
        exercises(count)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    return { data, error };
  }
}

// Database indexes and performance monitoring
export const databaseIndexes = {
  // Critical indexes for performance
  indexes: [
    // Workouts table indexes
    'CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);',
    'CREATE INDEX IF NOT EXISTS idx_workouts_user_completed ON workouts(user_id, is_completed);',
    'CREATE INDEX IF NOT EXISTS idx_workouts_date_desc ON workouts(date DESC);',
    
    // Exercises table indexes
    'CREATE INDEX IF NOT EXISTS idx_exercises_workout ON exercises(workout_id);',
    'CREATE INDEX IF NOT EXISTS idx_exercises_user_slug ON exercises(user_id, slug);',
    'CREATE INDEX IF NOT EXISTS idx_exercises_order ON exercises(workout_id, order_index);',
    
    // Exercise sets table indexes
    'CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON exercise_sets(exercise_id);',
    'CREATE INDEX IF NOT EXISTS idx_exercise_sets_user ON exercise_sets(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_exercise_sets_order ON exercise_sets(exercise_id, set_index);',
    
    // Weight logs table indexes
    'CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, measured_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(measured_at DESC);',
    
    // Profile table indexes
    'CREATE INDEX IF NOT EXISTS idx_profile_user ON profile(user_id);',
    
    // Plans table indexes
    'CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, start_date);',
  ],

  // Database functions for complex queries
  functions: [
    // Progress stats function
    `
    CREATE OR REPLACE FUNCTION get_progress_stats(
      user_id UUID,
      start_date DATE,
      end_date DATE
    )
    RETURNS TABLE (
      total_workouts BIGINT,
      completed_workouts BIGINT,
      total_sets BIGINT,
      total_reps BIGINT,
      avg_weight NUMERIC,
      completion_rate NUMERIC
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        COUNT(w.id) as total_workouts,
        COUNT(w.id) FILTER (WHERE w.is_completed = true) as completed_workouts,
        COUNT(es.id) as total_sets,
        COALESCE(SUM(es.reps), 0) as total_reps,
        COALESCE(AVG(es.weight), 0) as avg_weight,
        CASE 
          WHEN COUNT(w.id) > 0 THEN 
            ROUND((COUNT(w.id) FILTER (WHERE w.is_completed = true)::NUMERIC / COUNT(w.id)) * 100, 2)
          ELSE 0 
        END as completion_rate
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN exercise_sets es ON es.exercise_id = e.id
      WHERE w.user_id = get_progress_stats.user_id
        AND w.date >= get_progress_stats.start_date
        AND w.date <= get_progress_stats.end_date;
    END;
    $$;
    `,

    // Exercise search function with full-text search
    `
    CREATE OR REPLACE FUNCTION search_exercises(
      search_query TEXT,
      result_limit INTEGER DEFAULT 20
    )
    RETURNS TABLE (
      slug TEXT,
      name_en TEXT,
      name_es TEXT,
      muscle_groups TEXT[],
      equipment TEXT,
      rank REAL
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        el.slug,
        el.name_en,
        el.name_es,
        el.muscle_groups,
        el.equipment,
        ts_rank(
          to_tsvector('english', el.name_en || ' ' || el.name_es || ' ' || array_to_string(el.muscle_groups, ' ')),
          plainto_tsquery('english', search_query)
        ) as rank
      FROM exercise_library el
      WHERE to_tsvector('english', el.name_en || ' ' || el.name_es || ' ' || array_to_string(el.muscle_groups, ' '))
        @@ plainto_tsquery('english', search_query)
      ORDER BY rank DESC
      LIMIT result_limit;
    END;
    $$;
    `,

    // Exercise performance trends function
    `
    CREATE OR REPLACE FUNCTION get_exercise_performance_trends(
      user_id UUID,
      exercise_slug TEXT,
      start_date DATE
    )
    RETURNS TABLE (
      date DATE,
      max_weight NUMERIC,
      total_reps BIGINT,
      avg_rpe NUMERIC,
      total_sets BIGINT
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        w.date,
        MAX(es.weight) as max_weight,
        SUM(es.reps) as total_reps,
        AVG(es.rpe) as avg_rpe,
        COUNT(es.id) as total_sets
      FROM workouts w
      JOIN exercises e ON e.workout_id = w.id
      JOIN exercise_sets es ON es.exercise_id = e.id
      WHERE w.user_id = get_exercise_performance_trends.user_id
        AND e.slug = get_exercise_performance_trends.exercise_slug
        AND w.date >= get_exercise_performance_trends.start_date
        AND es.weight IS NOT NULL
        AND es.reps IS NOT NULL
      GROUP BY w.date
      ORDER BY w.date;
    END;
    $$;
    `
  ]
};

// Query performance monitoring
export class QueryPerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();

  static async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Store query time
      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }
      this.queryTimes.get(queryName)!.push(duration);
      
      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Query failed: ${queryName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  static getQueryStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || [];
    if (times.length === 0) return null;

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return {
      count: times.length,
      average: avg,
      min,
      max,
      total: times.reduce((sum, time) => sum + time, 0)
    };
  }

  static getAllQueryStats() {
    const stats: Record<string, any> = {};
    for (const [queryName] of this.queryTimes) {
      stats[queryName] = this.getQueryStats(queryName);
    }
    return stats;
  }

  static clearStats() {
    this.queryTimes.clear();
  }
}