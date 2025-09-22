/**
 * Planning service for workout scheduling and planning
 */

import { supabase } from './supabase';

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  workout_type: string;
  template_id?: string;
  is_active: boolean;
}

export interface PlannedWorkout {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  template_id?: string;
  status: 'planned' | 'completed' | 'skipped';
  notes?: string;
}

export interface PlannedWorkoutsSummary {
  thisWeek: {
    planned: number;
    completed: number;
    remaining: number;
  };
  thisMonth: {
    planned: number;
    completed: number;
  };
}

export class PlanningService {
  // Get user's workout schedule
  async getWorkoutSchedule(userId: string): Promise<WorkoutSchedule[]> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  }

  // Get planned workouts for a specific period
  async getPlannedWorkouts(userId: string, referenceDate: Date): Promise<PlannedWorkoutsSummary> {
    // Calculate week boundaries
    const weekStart = new Date(referenceDate);
    weekStart.setDate(referenceDate.getDate() - referenceDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Calculate month boundaries
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);

    // Get this week's planned workouts
    const { data: thisWeekPlanned } = await supabase
      .from('planned_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0]);

    // Get this month's planned workouts
    const { data: thisMonthPlanned } = await supabase
      .from('planned_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', monthStart.toISOString().split('T')[0])
      .lte('date', monthEnd.toISOString().split('T')[0]);

    // Calculate statistics
    const thisWeekTotal = thisWeekPlanned?.length || 0;
    const thisWeekCompleted = thisWeekPlanned?.filter(w => w.status === 'completed').length || 0;
    const thisWeekRemaining = thisWeekTotal - thisWeekCompleted;

    const thisMonthTotal = thisMonthPlanned?.length || 0;
    const thisMonthCompleted = thisMonthPlanned?.filter(w => w.status === 'completed').length || 0;

    return {
      thisWeek: {
        planned: thisWeekTotal,
        completed: thisWeekCompleted,
        remaining: thisWeekRemaining
      },
      thisMonth: {
        planned: thisMonthTotal,
        completed: thisMonthCompleted
      }
    };
  }

  // Get workouts for a specific date range (for calendar views)
  async getWorkoutsForDateRange(userId: string, startDate: Date, endDate: Date): Promise<PlannedWorkout[]> {
    const { data, error } = await supabase
      .from('planned_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date');

    if (error) throw error;
    return data || [];
  }

  // Create a planned workout
  async createPlannedWorkout(
    userId: string,
    date: string,
    workoutType: string,
    templateId?: string,
    notes?: string
  ): Promise<PlannedWorkout> {
    const { data, error } = await supabase
      .from('planned_workouts')
      .insert({
        user_id: userId,
        date,
        workout_type: workoutType,
        template_id: templateId,
        status: 'planned',
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update planned workout status
  async updatePlannedWorkoutStatus(
    workoutId: string,
    status: 'planned' | 'completed' | 'skipped',
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('planned_workouts')
      .update({ status, notes })
      .eq('id', workoutId);

    if (error) throw error;
  }

  // Create or update workout schedule
  async updateWorkoutSchedule(userId: string, schedules: Omit<WorkoutSchedule, 'id' | 'user_id'>[]): Promise<void> {
    // First, deactivate all existing schedules
    await supabase
      .from('workout_schedules')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Then insert new schedules
    const schedulesToInsert = schedules.map(schedule => ({
      ...schedule,
      user_id: userId,
      is_active: true
    }));

    const { error } = await supabase
      .from('workout_schedules')
      .insert(schedulesToInsert);

    if (error) throw error;
  }

  // Generate planned workouts based on schedule
  async generatePlannedWorkoutsFromSchedule(userId: string, startDate: Date, endDate: Date): Promise<void> {
    const schedule = await this.getWorkoutSchedule(userId);
    
    if (schedule.length === 0) return;

    const plannedWorkouts: Omit<PlannedWorkout, 'id'>[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const scheduleForDay = schedule.find(s => s.day_of_week === dayOfWeek);

      if (scheduleForDay) {
        // Check if workout already exists for this date
        const { data: existing } = await supabase
          .from('planned_workouts')
          .select('id')
          .eq('user_id', userId)
          .eq('date', currentDate.toISOString().split('T')[0])
          .single();

        if (!existing) {
          plannedWorkouts.push({
            user_id: userId,
            date: currentDate.toISOString().split('T')[0],
            workout_type: scheduleForDay.workout_type,
            template_id: scheduleForDay.template_id,
            status: 'planned'
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (plannedWorkouts.length > 0) {
      const { error } = await supabase
        .from('planned_workouts')
        .insert(plannedWorkouts);

      if (error) throw error;
    }
  }

  // Delete planned workout
  async deletePlannedWorkout(workoutId: string): Promise<void> {
    const { error } = await supabase
      .from('planned_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
  }

  // Get workout templates for planning
  async getWorkoutTemplatesForPlanning(userId: string): Promise<Array<{ id: string; name: string; description?: string }>> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('id, name, description')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }
}

export const planningService = new PlanningService();