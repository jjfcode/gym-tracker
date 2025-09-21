import { useMemo, useCallback } from 'react';
import type { 
  WorkoutTemplate, 
  WorkoutGeneration, 
  GeneratedWorkout, 
  UserWorkoutPreferences,
  TemplateSelectionCriteria
} from '../types/workout';
import { WorkoutGenerator } from '../lib';

export function useWorkoutGenerator() {
  const generateWorkoutPlan = useCallback((generation: WorkoutGeneration): GeneratedWorkout[] => {
    return WorkoutGenerator.generateWorkoutPlan(generation);
  }, []);

  const selectTemplate = useCallback((criteria: TemplateSelectionCriteria): WorkoutTemplate | null => {
    return WorkoutGenerator.selectTemplate(criteria);
  }, []);

  const createCustomTemplate = useCallback((
    baseTemplate: WorkoutTemplate,
    modifications: Parameters<typeof WorkoutGenerator.createCustomTemplate>[1]
  ): WorkoutTemplate => {
    return WorkoutGenerator.createCustomTemplate(baseTemplate, modifications);
  }, []);

  const generateProgressionSuggestions = useCallback((
    currentWorkout: GeneratedWorkout,
    previousPerformance?: Parameters<typeof WorkoutGenerator.generateProgressionSuggestions>[1]
  ): GeneratedWorkout => {
    return WorkoutGenerator.generateProgressionSuggestions(currentWorkout, previousPerformance);
  }, []);

  return {
    generateWorkoutPlan,
    selectTemplate,
    createCustomTemplate,
    generateProgressionSuggestions,
  };
}

export function useWorkoutPlanGeneration(
  template: WorkoutTemplate | null,
  preferences: UserWorkoutPreferences,
  startDate: string,
  weeksToGenerate: number = 4
) {
  const workoutPlan = useMemo(() => {
    if (!template) return [];
    
    const generation: WorkoutGeneration = {
      template,
      user_preferences: preferences,
      start_date: startDate,
      weeks_to_generate: weeksToGenerate,
    };

    try {
      return WorkoutGenerator.generateWorkoutPlan(generation);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      return [];
    }
  }, [template, preferences, startDate, weeksToGenerate]);

  const workoutsByWeek = useMemo(() => {
    const weeks: Record<string, GeneratedWorkout[]> = {};
    
    workoutPlan.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(workout);
    });

    // Sort workouts within each week by date
    Object.keys(weeks).forEach(weekKey => {
      weeks[weekKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return weeks;
  }, [workoutPlan]);

  const totalWorkouts = workoutPlan.length;
  const totalEstimatedTime = workoutPlan.reduce((sum, workout) => sum + workout.estimated_duration, 0);
  const averageWorkoutDuration = totalWorkouts > 0 ? Math.round(totalEstimatedTime / totalWorkouts) : 0;

  return {
    workoutPlan,
    workoutsByWeek,
    totalWorkouts,
    totalEstimatedTime,
    averageWorkoutDuration,
    hasWorkouts: workoutPlan.length > 0,
  };
}

export function useTemplateSelection(criteria: TemplateSelectionCriteria) {
  const selectedTemplate = useMemo(() => {
    return WorkoutGenerator.selectTemplate(criteria);
  }, [
    criteria.frequency,
    criteria.experience_level,
    criteria.available_equipment.join(','),
    criteria.time_per_session,
    criteria.goals.join(','),
  ]);

  return {
    selectedTemplate,
    hasTemplate: selectedTemplate !== null,
  };
}

export function useProgressionSuggestions(
  currentWorkout: GeneratedWorkout | null,
  previousPerformance?: Array<{
    exercise_slug: string;
    best_weight: number;
    best_reps: number;
  }>
) {
  const progressedWorkout = useMemo(() => {
    if (!currentWorkout) return null;
    
    return WorkoutGenerator.generateProgressionSuggestions(
      currentWorkout,
      previousPerformance
    );
  }, [currentWorkout, previousPerformance]);

  const hasProgressions = useMemo(() => {
    if (!currentWorkout || !progressedWorkout) return false;
    
    return currentWorkout.exercises.some((exercise, index) => {
      const progressedExercise = progressedWorkout.exercises[index];
      return progressedExercise && (
        progressedExercise.target_reps !== exercise.target_reps ||
        progressedExercise.target_sets !== exercise.target_sets
      );
    });
  }, [currentWorkout, progressedWorkout]);

  return {
    progressedWorkout,
    hasProgressions,
  };
}