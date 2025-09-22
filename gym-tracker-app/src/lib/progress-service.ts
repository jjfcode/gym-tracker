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
      .from('weight_entries')
      .select('weight, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(2);

    // Calculate statistics
    const totalWorkouts = workouts?.length || 0;
    const totalVolume = await this.calculateTotalVolume(userId, startDate, endDate);
    const averageWorkoutDuration = this.calculateAverageDuration(workouts || []);
    const currentStreak = await this.calculateCurrentStreak(userId);
    const longestStreak = await this.calculateLongestStreak(userId);
    
    let recentWeightChange = 0;
    if (recentWeights && recentWeights.length >= 2) {
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
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date');

    if (error) throw error;
    return data || [];
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
    const averageDuration = this.calculateAverageDuration(workouts || []);
    const totalVolume = this.calculateVolumeFromWorkouts(workouts || []);
    
    // Calculate consistency (workouts per week)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedWorkouts = Math.floor(totalDays / 7) * 3; // Assuming 3 workouts per week target
    const consistency = expectedWorkouts > 0 ? Math.min(100, (totalWorkouts / expectedWorkouts) * 100) : 0;

    // Group workouts by day
    const workoutsByDay = this.groupWorkoutsByDay(workouts || []);
    
    // Group volume by week
    const volumeByWeek = this.groupVolumeByWeek(workouts || []);

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
      .from('weight_entries')
      .upsert({
        user_id: userId,
        weight,
        date,
        notes
      }, {
        onConflict: 'user_id,date'
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

  private calculateAverageDuration(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    
    const totalDuration = workouts.reduce((total, workout) => {
      if (workout.started_at && workout.completed_at) {
        const duration = new Date(workout.completed_at).getTime() - new Date(workout.started_at).getTime();
        return total + (duration / (1000 * 60)); // Convert to minutes
      }
      return total;
    }, 0);

    return Math.round(totalDuration / workouts.length);
  }

  private calculateVolumeFromWorkouts(workouts: any[]): number {
    return workouts.reduce((total, workout) => {
      const workoutVolume = (workout.exercises || []).reduce((exerciseTotal: number, exercise: any) => {
        const exerciseVolume = (exercise.sets || []).reduce((setTotal: number, set: any) => {
          return setTotal + ((set.weight || 0) * (set.reps || 0));
        }, 0);
        return exerciseTotal + exerciseVolume;
      }, 0);
      return total + workoutVolume;
    }, 0);
  }

  private async calculateCurrentStreak(userId: string): Promise<number> {
    // This would implement streak calculation logic
    // For now, return a placeholder
    return 5;
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    // This would implement longest streak calculation logic
    // For now, return a placeholder
    return 12;
  }

  private groupWorkoutsByDay(workouts: any[]): Array<{ date: string; count: number }> {
    const grouped = workouts.reduce((acc, workout) => {
      const date = workout.completed_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  private groupVolumeByWeek(workouts: any[]): Array<{ week: string; volume: number }> {
    const grouped = workouts.reduce((acc, workout) => {
      const date = new Date(workout.completed_at);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const volume = this.calculateVolumeFromWorkouts([workout]);
      acc[weekKey] = (acc[weekKey] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([week, volume]) => ({ week, volume }));
  }
}

export const progressService = new ProgressService();