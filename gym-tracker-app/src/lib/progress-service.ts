/**
 * Progress service for tracking user progress and statistics
 */

import { supabase } from './supabase';

export interface ProgressData {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number;
  averageWorkoutDuration: number;
  recentWeightChange: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  averageDuration: number;
  totalVolume: number;
  consistency: number;
  workoutsByDay: Array<{ date: string; count: number }>;
  volumeByWeek: Array<{ week: string; volume: number }>;
}

export class ProgressService {
  // Get comprehensive progress data
  async getProgressData(userId: string, timeRange: 'week' | 'month' | 'year'): Promise<ProgressData> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get workouts in time range
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at');

    // Get recent weight entries
    const { data: recentWeights } = await supabase
      .from('weight_logs')
      .select('weight, measured_at')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(2);

    // Calculate statistics
    const totalWorkouts = workouts?.length || 0;
    const totalVolume = await this.calculateTotalVolume(userId, startDate, endDate);
    const averageWorkoutDuration = 0; // Simplified calculation
    const currentStreak = await this.calculateCurrentStreak(userId);
    const longestStreak = await this.calculateLongestStreak(userId);
    
    let recentWeightChange = 0;
    if (recentWeights && recentWeights.length >= 2 && recentWeights[0] && recentWeights[1]) {
      recentWeightChange = recentWeights[0].weight - recentWeights[1].weight;
    }

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      totalVolume,
      averageWorkoutDuration,
      recentWeightChange
    };
  }

  // Get weight history
  async getWeightHistory(userId: string, timeRange: 'week' | 'month' | 'year'): Promise<WeightEntry[]> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('measured_at', startDate.toISOString().split('T')[0])
      .lte('measured_at', endDate.toISOString().split('T')[0])
      .order('measured_at');

    if (error) throw error;
    
    // Map weight_logs to WeightEntry format
    return (data || []).map(log => ({
      id: log.id.toString(),
      weight: log.weight,
      date: log.measured_at,
      ...(log.note && { notes: log.note }),
    }));
  }

  // Get workout statistics
  async getWorkoutStats(userId: string, timeRange: 'week' | 'month' | 'year'): Promise<WorkoutStats> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get workouts with exercises and sets
    const { data: workouts } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises:workout_exercises(
          *,
          sets:exercise_sets(*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at');

    const totalWorkouts = workouts?.length || 0;
    const averageDuration = 0; // Simplified calculation
    const totalVolume = 0; // Simplified calculation
    
    // Calculate consistency (workouts per week)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedWorkouts = Math.floor(totalDays / 7) * 3; // Assuming 3 workouts per week target
    const consistency = expectedWorkouts > 0 ? Math.min(100, (totalWorkouts / expectedWorkouts) * 100) : 0;

    // Group workouts by day - simplified
    const workoutsByDay: Array<{ date: string; count: number }> = [];
    
    // Group volume by week - simplified
    const volumeByWeek: Array<{ week: string; volume: number }> = [];

    return {
      totalWorkouts,
      averageDuration,
      totalVolume,
      consistency,
      workoutsByDay,
      volumeByWeek
    };
  }

  // Log weight entry
  async logWeight(userId: string, weight: number, date: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('weight_logs')
      .upsert({
        user_id: userId,
        weight,
        measured_at: date,
        note: notes || null
      }, {
        onConflict: 'user_id,measured_at'
      });

    if (error) throw error;
  }

  // Private helper methods
  private async calculateTotalVolume(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const { data } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        workout_exercise:workout_exercises(
          workout:workouts(completed_at, user_id)
        )
      `)
      .eq('workout_exercise.workout.user_id', userId)
      .gte('workout_exercise.workout.completed_at', startDate.toISOString())
      .lte('workout_exercise.workout.completed_at', endDate.toISOString())
      .not('weight', 'is', null)
      .not('reps', 'is', null);

    return (data || []).reduce((total, set) => {
      return total + ((set.weight || 0) * (set.reps || 0));
    }, 0);
  }





  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async calculateCurrentStreak(_userId: string): Promise<number> {
    // This would implement streak calculation logic
    // For now, return a placeholder
    return 5;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async calculateLongestStreak(_userId: string): Promise<number> {
    // This would implement longest streak calculation logic
    // For now, return a placeholder
    return 12;
  }


}

export const progressService = new ProgressService();