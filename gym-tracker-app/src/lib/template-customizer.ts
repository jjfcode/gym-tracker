import type { 
  WorkoutTemplate, 
  TemplateExercise, 
  PlanCustomization,
  Equipment,
  MuscleGroup
} from '../types/workout';
import { ExerciseLibrary } from './exercise-library';

export interface CustomizationOptions {
  name?: string;
  description?: string;
  exerciseModifications?: ExerciseModification[];
  globalAdjustments?: GlobalAdjustments;
}

export interface ExerciseModification {
  type: 'add' | 'remove' | 'replace' | 'modify';
  exerciseSlug: string;
  newExercise?: {
    slug: string;
    target_sets?: number;
    target_reps?: number;
  };
  modifications?: {
    target_sets?: number;
    target_reps?: number;
    order_index?: number;
  };
}

export interface GlobalAdjustments {
  setsMultiplier?: number;
  repsAdjustment?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxExercises?: number;
  focusMuscleGroups?: MuscleGroup[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TemplateCustomizer {
  /**
   * Apply customizations to a workout template
   */
  static customizeTemplate(
    baseTemplate: WorkoutTemplate,
    options: CustomizationOptions
  ): WorkoutTemplate {
    let customizedTemplate: WorkoutTemplate = {
      ...baseTemplate,
      id: `${baseTemplate.id}-custom-${Date.now()}`,
      name: options.name || `${baseTemplate.name} (Custom)`,
      description: options.description || baseTemplate.description,
      exercises: [...baseTemplate.exercises],
    };

    // Apply exercise modifications
    if (options.exerciseModifications) {
      customizedTemplate = this.applyExerciseModifications(
        customizedTemplate,
        options.exerciseModifications
      );
    }

    // Apply global adjustments
    if (options.globalAdjustments) {
      customizedTemplate = this.applyGlobalAdjustments(
        customizedTemplate,
        options.globalAdjustments
      );
    }

    // Reorder exercises and update indices
    customizedTemplate.exercises = this.reorderExercises(customizedTemplate.exercises);

    return customizedTemplate;
  }

  /**
   * Apply individual exercise modifications
   */
  private static applyExerciseModifications(
    template: WorkoutTemplate,
    modifications: ExerciseModification[]
  ): WorkoutTemplate {
    let exercises = [...template.exercises];

    modifications.forEach(mod => {
      switch (mod.type) {
        case 'add':
          if (mod.newExercise) {
            const libraryExercise = ExerciseLibrary.getBySlug(mod.newExercise.slug);
            if (libraryExercise) {
              const newExercise: TemplateExercise = {
                slug: libraryExercise.slug,
                name_en: libraryExercise.name_en,
                name_es: libraryExercise.name_es,
                target_sets: mod.newExercise.target_sets || 3,
                target_reps: mod.newExercise.target_reps || 10,
                muscle_groups: libraryExercise.muscle_groups,
                equipment: libraryExercise.equipment,
                difficulty_level: libraryExercise.difficulty_level,
                is_compound: libraryExercise.is_compound,
                instructions_en: libraryExercise.instructions_en,
                instructions_es: libraryExercise.instructions_es,
              };
              exercises.push(newExercise);
            }
          }
          break;

        case 'remove':
          exercises = exercises.filter(ex => ex.slug !== mod.exerciseSlug);
          break;

        case 'replace':
          if (mod.newExercise) {
            const exerciseIndex = exercises.findIndex(ex => ex.slug === mod.exerciseSlug);
            if (exerciseIndex !== -1) {
              const libraryExercise = ExerciseLibrary.getBySlug(mod.newExercise.slug);
              if (libraryExercise) {
                const replacementExercise: TemplateExercise = {
                  slug: libraryExercise.slug,
                  name_en: libraryExercise.name_en,
                  name_es: libraryExercise.name_es,
                  target_sets: mod.newExercise.target_sets || exercises[exerciseIndex].target_sets,
                  target_reps: mod.newExercise.target_reps || exercises[exerciseIndex].target_reps,
                  muscle_groups: libraryExercise.muscle_groups,
                  equipment: libraryExercise.equipment,
                  difficulty_level: libraryExercise.difficulty_level,
                  is_compound: libraryExercise.is_compound,
                  instructions_en: libraryExercise.instructions_en,
                  instructions_es: libraryExercise.instructions_es,
                };
                exercises[exerciseIndex] = replacementExercise;
              }
            }
          }
          break;

        case 'modify':
          if (mod.modifications) {
            const exerciseIndex = exercises.findIndex(ex => ex.slug === mod.exerciseSlug);
            if (exerciseIndex !== -1) {
              exercises[exerciseIndex] = {
                ...exercises[exerciseIndex],
                target_sets: mod.modifications.target_sets ?? exercises[exerciseIndex].target_sets,
                target_reps: mod.modifications.target_reps ?? exercises[exerciseIndex].target_reps,
              };
            }
          }
          break;
      }
    });

    return { ...template, exercises };
  }

  /**
   * Apply global adjustments to all exercises
   */
  private static applyGlobalAdjustments(
    template: WorkoutTemplate,
    adjustments: GlobalAdjustments
  ): WorkoutTemplate {
    let exercises = [...template.exercises];

    // Apply sets multiplier
    if (adjustments.setsMultiplier) {
      exercises = exercises.map(exercise => ({
        ...exercise,
        target_sets: Math.max(1, Math.round(exercise.target_sets * adjustments.setsMultiplier!)),
      }));
    }

    // Apply reps adjustment
    if (adjustments.repsAdjustment) {
      exercises = exercises.map(exercise => ({
        ...exercise,
        target_reps: Math.max(1, exercise.target_reps + adjustments.repsAdjustment!),
      }));
    }

    // Apply difficulty level
    if (adjustments.difficultyLevel) {
      exercises = exercises.map(exercise => ({
        ...exercise,
        difficulty_level: adjustments.difficultyLevel!,
      }));
    }

    // Filter by focus muscle groups
    if (adjustments.focusMuscleGroups && adjustments.focusMuscleGroups.length > 0) {
      exercises = exercises.filter(exercise =>
        exercise.muscle_groups.some(group =>
          adjustments.focusMuscleGroups!.includes(group)
        )
      );
    }

    // Limit number of exercises
    if (adjustments.maxExercises && exercises.length > adjustments.maxExercises) {
      // Prioritize compound exercises
      const compoundExercises = exercises.filter(ex => ex.is_compound);
      const isolationExercises = exercises.filter(ex => !ex.is_compound);
      
      const maxCompound = Math.min(compoundExercises.length, Math.floor(adjustments.maxExercises * 0.7));
      const maxIsolation = adjustments.maxExercises - maxCompound;
      
      exercises = [
        ...compoundExercises.slice(0, maxCompound),
        ...isolationExercises.slice(0, maxIsolation),
      ];
    }

    return { ...template, exercises };
  }

  /**
   * Reorder exercises for optimal workout flow
   */
  private static reorderExercises(exercises: TemplateExercise[]): TemplateExercise[] {
    // Sort by: compound first, then by muscle group size (larger muscles first)
    const muscleGroupPriority: Record<string, number> = {
      'quadriceps': 1, 'back': 2, 'chest': 3, 'hamstrings': 4, 'shoulders': 5,
      'glutes': 6, 'lats': 7, 'triceps': 8, 'biceps': 9, 'calves': 10,
      'abs': 11, 'obliques': 12, 'forearms': 13, 'traps': 14, 'rhomboids': 15, 'rear-delts': 16
    };

    return exercises
      .map((exercise, index) => ({ ...exercise, original_index: index }))
      .sort((a, b) => {
        // Compound exercises first
        if (a.is_compound && !b.is_compound) return -1;
        if (!a.is_compound && b.is_compound) return 1;

        // Then by primary muscle group priority
        const aPriority = Math.min(...a.muscle_groups.map(mg => muscleGroupPriority[mg] || 99));
        const bPriority = Math.min(...b.muscle_groups.map(mg => muscleGroupPriority[mg] || 99));
        
        if (aPriority !== bPriority) return aPriority - bPriority;

        // Finally by original order
        return (a as any).original_index - (b as any).original_index;
      })
      .map(exercise => {
        const { original_index, ...cleanExercise } = exercise as any;
        return cleanExercise;
      });
  }

  /**
   * Validate a customized template
   */
  static validateTemplate(template: WorkoutTemplate): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum requirements
    if (template.exercises.length === 0) {
      errors.push('Template must have at least one exercise');
    }

    if (template.exercises.length > 15) {
      warnings.push('Template has many exercises, consider reducing for better workout duration');
    }

    // Check exercise validity
    template.exercises.forEach((exercise, index) => {
      if (exercise.target_sets < 1 || exercise.target_sets > 10) {
        errors.push(`Exercise ${index + 1}: Sets must be between 1 and 10`);
      }

      if (exercise.target_reps < 1 || exercise.target_reps > 50) {
        errors.push(`Exercise ${index + 1}: Reps must be between 1 and 50`);
      }

      if (!ExerciseLibrary.getBySlug(exercise.slug)) {
        warnings.push(`Exercise ${index + 1}: ${exercise.slug} not found in exercise library`);
      }
    });

    // Check muscle group balance
    const muscleGroups = new Set(
      template.exercises.flatMap(ex => ex.muscle_groups)
    );

    if (muscleGroups.size < 2) {
      warnings.push('Consider adding exercises for more muscle groups for a balanced workout');
    }

    // Check compound vs isolation balance
    const compoundCount = template.exercises.filter(ex => ex.is_compound).length;
    const totalCount = template.exercises.length;
    
    if (compoundCount === 0 && totalCount > 3) {
      warnings.push('Consider adding compound exercises for better efficiency');
    }

    // Estimate workout duration
    const estimatedDuration = this.estimateWorkoutDuration(template);
    if (estimatedDuration > 90) {
      warnings.push(`Estimated workout duration (${estimatedDuration} min) may be too long`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Estimate workout duration
   */
  private static estimateWorkoutDuration(template: WorkoutTemplate): number {
    const totalSets = template.exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
    const baseTime = totalSets * 2.5; // 2.5 minutes per set
    const warmupCooldown = 10;
    return Math.round(baseTime + warmupCooldown);
  }

  /**
   * Generate smart exercise suggestions for adding to template
   */
  static generateExerciseSuggestions(
    currentTemplate: WorkoutTemplate,
    criteria?: {
      targetMuscleGroups?: MuscleGroup[];
      availableEquipment?: Equipment[];
      maxSuggestions?: number;
    }
  ): Array<{
    exercise: TemplateExercise;
    reason: string;
    priority: number;
  }> {
    const suggestions: Array<{
      exercise: TemplateExercise;
      reason: string;
      priority: number;
    }> = [];

    // Analyze current template
    const currentMuscleGroups = new Set(
      currentTemplate.exercises.flatMap(ex => ex.muscle_groups)
    );
    const currentEquipment = new Set(
      currentTemplate.exercises.map(ex => ex.equipment)
    );
    const currentSlugs = new Set(
      currentTemplate.exercises.map(ex => ex.slug)
    );

    // Find missing muscle groups
    const allMuscleGroups: MuscleGroup[] = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 
      'hamstrings', 'glutes', 'calves', 'abs'
    ];

    const missingMuscleGroups = allMuscleGroups.filter(
      mg => !currentMuscleGroups.has(mg)
    );

    // Generate suggestions for missing muscle groups
    missingMuscleGroups.forEach(muscleGroup => {
      const exercises = ExerciseLibrary.getByMuscleGroup(muscleGroup)
        .filter(ex => !currentSlugs.has(ex.slug))
        .filter(ex => !criteria?.availableEquipment || 
          criteria.availableEquipment.includes(ex.equipment))
        .slice(0, 2); // Top 2 for each muscle group

      exercises.forEach(libraryEx => {
        const templateExercise: TemplateExercise = {
          slug: libraryEx.slug,
          name_en: libraryEx.name_en,
          name_es: libraryEx.name_es,
          target_sets: 3,
          target_reps: 10,
          muscle_groups: libraryEx.muscle_groups,
          equipment: libraryEx.equipment,
          difficulty_level: libraryEx.difficulty_level,
          is_compound: libraryEx.is_compound,
          instructions_en: libraryEx.instructions_en,
          instructions_es: libraryEx.instructions_es,
        };

        suggestions.push({
          exercise: templateExercise,
          reason: `Targets ${muscleGroup} which is missing from current template`,
          priority: libraryEx.is_compound ? 3 : 2,
        });
      });
    });

    // Sort by priority and limit results
    const maxSuggestions = criteria?.maxSuggestions || 5;
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxSuggestions);
  }

  /**
   * Create template variations for different goals
   */
  static createGoalVariations(baseTemplate: WorkoutTemplate): {
    strength: WorkoutTemplate;
    hypertrophy: WorkoutTemplate;
    endurance: WorkoutTemplate;
  } {
    return {
      strength: this.customizeTemplate(baseTemplate, {
        name: `${baseTemplate.name} (Strength Focus)`,
        globalAdjustments: {
          setsMultiplier: 1.2,
          repsAdjustment: -3,
          maxExercises: 6,
        },
      }),
      hypertrophy: this.customizeTemplate(baseTemplate, {
        name: `${baseTemplate.name} (Muscle Building)`,
        globalAdjustments: {
          setsMultiplier: 1.1,
          repsAdjustment: 2,
        },
      }),
      endurance: this.customizeTemplate(baseTemplate, {
        name: `${baseTemplate.name} (Endurance Focus)`,
        globalAdjustments: {
          setsMultiplier: 0.8,
          repsAdjustment: 5,
        },
      }),
    };
  }
}