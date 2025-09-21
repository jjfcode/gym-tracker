import type { 
  WorkoutTemplate, 
  WorkoutGeneration, 
  GeneratedWorkout, 
  UserWorkoutPreferences,
  TemplateSelectionCriteria,
  WeeklySchedule,
  WorkoutDay
} from '../types/workout';
import { WorkoutTemplates, WEEKLY_SCHEDULES } from './workout-templates';
import { ExerciseLibrary } from './exercise-library';

export class WorkoutGenerator {
  /**
   * Generate a complete workout plan based on user preferences
   */
  static generateWorkoutPlan(generation: WorkoutGeneration): GeneratedWorkout[] {
    const { template, user_preferences, start_date, weeks_to_generate } = generation;
    const workouts: GeneratedWorkout[] = [];
    
    const startDate = new Date(start_date);
    const weeklySchedule = WorkoutTemplates.getWeeklySchedule(user_preferences.goal_days_per_week);
    
    if (!weeklySchedule) {
      throw new Error(`No weekly schedule found for ${user_preferences.goal_days_per_week} days per week`);
    }

    // Generate workouts for the specified number of weeks
    for (let week = 0; week < weeks_to_generate; week++) {
      const weekWorkouts = this.generateWeeklyWorkouts(
        template,
        weeklySchedule,
        startDate,
        week,
        user_preferences
      );
      workouts.push(...weekWorkouts);
    }

    return workouts;
  }

  /**
   * Generate workouts for a single week
   */
  private static generateWeeklyWorkouts(
    template: WorkoutTemplate,
    schedule: WeeklySchedule,
    startDate: Date,
    weekOffset: number,
    preferences: UserWorkoutPreferences
  ): GeneratedWorkout[] {
    const workouts: GeneratedWorkout[] = [];
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    
    daysOfWeek.forEach((day, dayIndex) => {
      const workoutDay = schedule[day];
      if (workoutDay?.type === 'workout') {
        const workoutDate = new Date(startDate);
        workoutDate.setDate(startDate.getDate() + (weekOffset * 7) + dayIndex);
        
        const workout = this.generateDailyWorkout(
          template,
          workoutDay,
          workoutDate.toISOString().split('T')[0],
          preferences
        );
        
        if (workout) {
          workouts.push(workout);
        }
      }
    });

    return workouts;
  }

  /**
   * Generate a single day's workout
   */
  private static generateDailyWorkout(
    template: WorkoutTemplate,
    workoutDay: WorkoutDay,
    date: string,
    preferences: UserWorkoutPreferences
  ): GeneratedWorkout | null {
    if (workoutDay.type !== 'workout' || !workoutDay.template_name) {
      return null;
    }

    // Get exercises for this workout type
    let exercises = workoutDay.exercises || template.exercises;
    
    // Filter out excluded exercises
    exercises = exercises.filter(
      exercise => !preferences.excluded_exercises.includes(exercise.slug)
    );

    // Filter by available equipment
    if (preferences.preferred_equipment.length > 0) {
      exercises = exercises.filter(
        exercise => preferences.preferred_equipment.includes(exercise.equipment || 'none')
      );
    }

    // Adjust for difficulty preference
    exercises = this.adjustExercisesForDifficulty(exercises, preferences.difficulty_preference);

    // Estimate workout duration
    const estimatedDuration = this.estimateWorkoutDuration(exercises);

    return {
      date,
      title: workoutDay.template_name,
      type: template.type,
      exercises,
      estimated_duration: estimatedDuration,
    };
  }

  /**
   * Adjust exercises based on difficulty preference
   */
  private static adjustExercisesForDifficulty(
    exercises: any[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ) {
    return exercises.map(exercise => {
      const adjustments = {
        beginner: { setsMultiplier: 0.8, repsAdjustment: -2 },
        intermediate: { setsMultiplier: 1.0, repsAdjustment: 0 },
        advanced: { setsMultiplier: 1.2, repsAdjustment: 2 },
      };

      const adjustment = adjustments[difficulty];
      
      return {
        ...exercise,
        target_sets: Math.max(1, Math.round(exercise.target_sets * adjustment.setsMultiplier)),
        target_reps: Math.max(1, exercise.target_reps + adjustment.repsAdjustment),
        difficulty_level: difficulty,
      };
    });
  }

  /**
   * Estimate workout duration based on exercises
   */
  private static estimateWorkoutDuration(exercises: any[]): number {
    // Rough estimation: 2-3 minutes per set + rest time
    const totalSets = exercises.reduce((sum, exercise) => sum + exercise.target_sets, 0);
    const baseTime = totalSets * 2.5; // 2.5 minutes per set on average
    const warmupCooldown = 10; // 10 minutes for warmup and cooldown
    
    return Math.round(baseTime + warmupCooldown);
  }

  /**
   * Select the best template based on user criteria
   */
  static selectTemplate(criteria: TemplateSelectionCriteria): WorkoutTemplate | null {
    const availableTemplates = WorkoutTemplates.getTemplatesForFrequency(criteria.frequency);
    
    if (availableTemplates.length === 0) {
      return null;
    }

    // Score templates based on criteria
    const scoredTemplates = availableTemplates.map(template => ({
      template,
      score: this.scoreTemplate(template, criteria),
    }));

    // Sort by score and return the best match
    scoredTemplates.sort((a, b) => b.score - a.score);
    
    return scoredTemplates[0]?.template || null;
  }

  /**
   * Score a template based on how well it matches user criteria
   */
  private static scoreTemplate(template: WorkoutTemplate, criteria: TemplateSelectionCriteria): number {
    let score = 0;

    // Frequency match (most important)
    if (template.frequency === criteria.frequency) {
      score += 50;
    }

    // Equipment availability
    const templateEquipment = [...new Set(template.exercises.map(e => e.equipment))];
    const availableEquipmentCount = templateEquipment.filter(
      equipment => criteria.available_equipment.includes(equipment || 'none')
    ).length;
    score += (availableEquipmentCount / templateEquipment.length) * 30;

    // Experience level match
    const templateDifficulty = this.getTemplateDifficulty(template);
    if (templateDifficulty === criteria.experience_level) {
      score += 20;
    } else if (
      (templateDifficulty === 'intermediate' && criteria.experience_level === 'beginner') ||
      (templateDifficulty === 'intermediate' && criteria.experience_level === 'advanced')
    ) {
      score += 10; // Intermediate templates are adaptable
    }

    return score;
  }

  /**
   * Determine the overall difficulty level of a template
   */
  private static getTemplateDifficulty(template: WorkoutTemplate): 'beginner' | 'intermediate' | 'advanced' {
    const difficulties = template.exercises.map(e => e.difficulty_level);
    const avgDifficulty = difficulties.reduce((sum, diff) => {
      const values = { beginner: 1, intermediate: 2, advanced: 3 };
      return sum + values[diff];
    }, 0) / difficulties.length;

    if (avgDifficulty <= 1.3) return 'beginner';
    if (avgDifficulty <= 2.3) return 'intermediate';
    return 'advanced';
  }

  /**
   * Create a custom template by modifying an existing one
   */
  static createCustomTemplate(
    baseTemplate: WorkoutTemplate,
    modifications: {
      name?: string;
      addExercises?: string[]; // exercise slugs to add
      removeExercises?: string[]; // exercise slugs to remove
      modifyExercises?: Array<{
        slug: string;
        target_sets?: number;
        target_reps?: number;
      }>;
    }
  ): WorkoutTemplate {
    let exercises = [...baseTemplate.exercises];

    // Remove exercises
    if (modifications.removeExercises) {
      exercises = exercises.filter(
        exercise => !modifications.removeExercises!.includes(exercise.slug)
      );
    }

    // Add exercises
    if (modifications.addExercises) {
      const newExercises = modifications.addExercises
        .map(slug => ExerciseLibrary.getBySlug(slug))
        .filter(Boolean)
        .map(libraryExercise => ({
          slug: libraryExercise!.slug,
          name_en: libraryExercise!.name_en,
          name_es: libraryExercise!.name_es,
          target_sets: 3,
          target_reps: 10,
          muscle_groups: libraryExercise!.muscle_groups,
          equipment: libraryExercise!.equipment,
          difficulty_level: libraryExercise!.difficulty_level,
          is_compound: libraryExercise!.is_compound,
        }));
      
      exercises.push(...newExercises);
    }

    // Modify exercises
    if (modifications.modifyExercises) {
      exercises = exercises.map(exercise => {
        const modification = modifications.modifyExercises!.find(
          mod => mod.slug === exercise.slug
        );
        
        if (modification) {
          return {
            ...exercise,
            target_sets: modification.target_sets ?? exercise.target_sets,
            target_reps: modification.target_reps ?? exercise.target_reps,
          };
        }
        
        return exercise;
      });
    }

    return {
      ...baseTemplate,
      id: `${baseTemplate.id}-custom-${Date.now()}`,
      name: modifications.name || `${baseTemplate.name} (Custom)`,
      exercises,
    };
  }

  /**
   * Generate progressive overload suggestions
   */
  static generateProgressionSuggestions(
    currentWorkout: GeneratedWorkout,
    previousPerformance?: Array<{
      exercise_slug: string;
      best_weight: number;
      best_reps: number;
    }>
  ): GeneratedWorkout {
    if (!previousPerformance || previousPerformance.length === 0) {
      return currentWorkout;
    }

    const progressedExercises = currentWorkout.exercises.map(exercise => {
      const previousPerf = previousPerformance.find(
        perf => perf.exercise_slug === exercise.slug
      );

      if (previousPerf) {
        // Simple progression logic: increase weight by 2.5-5% or add 1-2 reps
        const weightIncrease = Math.max(2.5, previousPerf.best_weight * 0.025);
        const repIncrease = previousPerf.best_reps >= exercise.target_reps ? 0 : 1;

        return {
          ...exercise,
          target_reps: exercise.target_reps + repIncrease,
          // Note: weight progression would be handled during workout execution
        };
      }

      return exercise;
    });

    return {
      ...currentWorkout,
      exercises: progressedExercises,
    };
  }
}