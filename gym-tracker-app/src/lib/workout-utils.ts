import type { 
  WorkoutTemplate, 
  TemplateExercise, 
  GeneratedWorkout,
  ExerciseProgress,
  WorkoutProgress,
  MuscleGroup,
  Equipment
} from '../types/workout';

export class WorkoutUtils {
  /**
   * Calculate total workout volume (sets × reps × weight)
   */
  static calculateWorkoutVolume(
    exercises: Array<{
      sets: Array<{ weight?: number; reps?: number }>;
    }>
  ): number {
    return exercises.reduce((totalVolume, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setVolume, set) => {
        return setVolume + ((set.weight || 0) * (set.reps || 0));
      }, 0);
      return totalVolume + exerciseVolume;
    }, 0);
  }

  /**
   * Calculate workout completion percentage
   */
  static calculateCompletionRate(
    plannedExercises: TemplateExercise[],
    completedSets: Array<{
      exercise_slug: string;
      completed_sets: number;
    }>
  ): number {
    const totalPlannedSets = plannedExercises.reduce(
      (sum, exercise) => sum + exercise.target_sets, 
      0
    );

    const totalCompletedSets = completedSets.reduce(
      (sum, exercise) => sum + exercise.completed_sets,
      0
    );

    return totalPlannedSets > 0 ? (totalCompletedSets / totalPlannedSets) * 100 : 0;
  }

  /**
   * Estimate one-rep max using Epley formula
   */
  static estimateOneRepMax(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  /**
   * Calculate training volume for a specific muscle group
   */
  static calculateMuscleGroupVolume(
    exercises: Array<{
      muscle_groups: MuscleGroup[];
      sets: Array<{ weight?: number; reps?: number }>;
    }>,
    targetMuscleGroup: MuscleGroup
  ): number {
    return exercises
      .filter(exercise => exercise.muscle_groups.includes(targetMuscleGroup))
      .reduce((volume, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setVolume, set) => {
          return setVolume + ((set.weight || 0) * (set.reps || 0));
        }, 0);
        return volume + exerciseVolume;
      }, 0);
  }

  /**
   * Get muscle groups trained in a workout
   */
  static getMuscleGroupsCovered(exercises: TemplateExercise[]): MuscleGroup[] {
    const muscleGroups = new Set<MuscleGroup>();
    exercises.forEach(exercise => {
      exercise.muscle_groups.forEach(group => muscleGroups.add(group));
    });
    return Array.from(muscleGroups);
  }

  /**
   * Check if workout is balanced (covers major muscle groups)
   */
  static isWorkoutBalanced(exercises: TemplateExercise[]): {
    isBalanced: boolean;
    missingGroups: MuscleGroup[];
    coverage: Record<string, boolean>;
  } {
    const majorMuscleGroups: MuscleGroup[] = [
      'chest', 'back', 'shoulders', 'quadriceps', 'hamstrings'
    ];
    
    const coveredGroups = this.getMuscleGroupsCovered(exercises);
    const coverage: Record<string, boolean> = {};
    
    majorMuscleGroups.forEach(group => {
      coverage[group] = coveredGroups.includes(group);
    });

    const missingGroups = majorMuscleGroups.filter(
      group => !coveredGroups.includes(group)
    );

    return {
      isBalanced: missingGroups.length <= 1, // Allow 1 missing for flexibility
      missingGroups,
      coverage,
    };
  }

  /**
   * Calculate workout intensity based on RPE
   */
  static calculateWorkoutIntensity(
    sets: Array<{ rpe?: number }>
  ): {
    averageRPE: number;
    intensityLevel: 'low' | 'moderate' | 'high' | 'very-high';
  } {
    const rpeSets = sets.filter(set => set.rpe !== undefined);
    
    if (rpeSets.length === 0) {
      return { averageRPE: 0, intensityLevel: 'low' };
    }

    const averageRPE = rpeSets.reduce((sum, set) => sum + (set.rpe || 0), 0) / rpeSets.length;
    
    let intensityLevel: 'low' | 'moderate' | 'high' | 'very-high';
    if (averageRPE < 6) intensityLevel = 'low';
    else if (averageRPE < 7.5) intensityLevel = 'moderate';
    else if (averageRPE < 9) intensityLevel = 'high';
    else intensityLevel = 'very-high';

    return { averageRPE: Math.round(averageRPE * 10) / 10, intensityLevel };
  }

  /**
   * Generate progressive overload suggestions
   */
  static generateProgressionSuggestions(
    currentPerformance: {
      exercise_slug: string;
      best_weight: number;
      best_reps: number;
      target_reps: number;
    }[]
  ): Array<{
    exercise_slug: string;
    suggestion_type: 'increase_weight' | 'increase_reps' | 'add_set';
    current_weight: number;
    suggested_weight?: number;
    current_reps: number;
    suggested_reps?: number;
    reason: string;
  }> {
    return currentPerformance.map(perf => {
      // If reps are at or above target, suggest weight increase
      if (perf.best_reps >= perf.target_reps) {
        const weightIncrease = Math.max(2.5, perf.best_weight * 0.025); // 2.5% increase minimum
        return {
          exercise_slug: perf.exercise_slug,
          suggestion_type: 'increase_weight' as const,
          current_weight: perf.best_weight,
          suggested_weight: perf.best_weight + weightIncrease,
          current_reps: perf.best_reps,
          reason: `You've hit ${perf.best_reps} reps, time to increase weight`,
        };
      } else {
        // Otherwise suggest rep increase
        return {
          exercise_slug: perf.exercise_slug,
          suggestion_type: 'increase_reps' as const,
          current_weight: perf.best_weight,
          current_reps: perf.best_reps,
          suggested_reps: Math.min(perf.target_reps, perf.best_reps + 1),
          reason: `Focus on reaching ${perf.target_reps} reps before increasing weight`,
        };
      }
    });
  }

  /**
   * Calculate rest time suggestions based on exercise type and intensity
   */
  static calculateRestTime(
    exercise: TemplateExercise,
    intensity: 'low' | 'moderate' | 'high' | 'very-high'
  ): {
    minSeconds: number;
    maxSeconds: number;
    recommendation: string;
  } {
    let baseRest = 60; // Base rest time in seconds

    // Adjust for exercise type
    if (exercise.is_compound) {
      baseRest += 30; // Compound exercises need more rest
    }

    // Adjust for intensity
    const intensityMultipliers = {
      low: 0.8,
      moderate: 1.0,
      high: 1.3,
      'very-high': 1.5,
    };

    const adjustedRest = baseRest * intensityMultipliers[intensity];
    const minSeconds = Math.round(adjustedRest * 0.8);
    const maxSeconds = Math.round(adjustedRest * 1.2);

    let recommendation = '';
    if (exercise.is_compound && intensity === 'high') {
      recommendation = 'Take adequate rest for compound movements at high intensity';
    } else if (!exercise.is_compound && intensity === 'low') {
      recommendation = 'Shorter rest periods are fine for isolation exercises';
    } else {
      recommendation = `Rest ${Math.round(adjustedRest / 60)} minutes between sets`;
    }

    return { minSeconds, maxSeconds, recommendation };
  }

  /**
   * Analyze workout frequency and recovery
   */
  static analyzeWorkoutFrequency(
    workouts: Array<{ date: string; muscle_groups: MuscleGroup[] }>,
    days: number = 7
  ): {
    frequency: number;
    muscleGroupFrequency: Record<MuscleGroup, number>;
    recoveryAnalysis: {
      adequateRecovery: boolean;
      overtrainedMuscleGroups: MuscleGroup[];
      undertrainedMuscleGroups: MuscleGroup[];
    };
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentWorkouts = workouts.filter(
      workout => new Date(workout.date) >= cutoffDate
    );

    const frequency = recentWorkouts.length;
    const muscleGroupFrequency: Record<string, number> = {};

    // Count muscle group frequency
    recentWorkouts.forEach(workout => {
      workout.muscle_groups.forEach(group => {
        muscleGroupFrequency[group] = (muscleGroupFrequency[group] || 0) + 1;
      });
    });

    // Analyze recovery (simple heuristic)
    const overtrainedMuscleGroups: MuscleGroup[] = [];
    const undertrainedMuscleGroups: MuscleGroup[] = [];

    Object.entries(muscleGroupFrequency).forEach(([group, freq]) => {
      if (freq > 3) { // More than 3 times per week might be overtraining
        overtrainedMuscleGroups.push(group as MuscleGroup);
      } else if (freq < 1) { // Less than once per week might be undertraining
        undertrainedMuscleGroups.push(group as MuscleGroup);
      }
    });

    return {
      frequency,
      muscleGroupFrequency: muscleGroupFrequency as Record<MuscleGroup, number>,
      recoveryAnalysis: {
        adequateRecovery: overtrainedMuscleGroups.length === 0,
        overtrainedMuscleGroups,
        undertrainedMuscleGroups,
      },
    };
  }

  /**
   * Format workout duration in human-readable format
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Convert weight between units
   */
  static convertWeight(
    weight: number, 
    fromUnit: 'kg' | 'lbs', 
    toUnit: 'kg' | 'lbs'
  ): number {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return Math.round(weight * 2.20462 * 10) / 10; // Round to 1 decimal
    } else {
      return Math.round(weight / 2.20462 * 10) / 10; // Round to 1 decimal
    }
  }

  /**
   * Get equipment categories for filtering
   */
  static getEquipmentCategories(): Record<string, Equipment[]> {
    return {
      'Free Weights': ['barbell', 'dumbbell', 'kettlebell'],
      'Machines': ['machine', 'cable', 'smith-machine'],
      'Bodyweight': ['bodyweight', 'pull-up-bar'],
      'Accessories': ['resistance-band', 'bench'],
    };
  }

  /**
   * Get muscle group categories for organization
   */
  static getMuscleGroupCategories(): Record<string, MuscleGroup[]> {
    return {
      'Upper Body Push': ['chest', 'shoulders', 'triceps'],
      'Upper Body Pull': ['back', 'lats', 'biceps', 'rhomboids', 'rear-delts'],
      'Lower Body': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      'Core': ['abs', 'obliques'],
      'Accessories': ['forearms', 'traps'],
    };
  }
}