import type { 
  WorkoutTemplate, 
  TemplateSelectionCriteria, 
  UserWorkoutPreferences,
  Equipment,
  WorkoutGoal
} from '../types/workout';
import { WorkoutTemplates } from './workout-templates';
import { ExerciseLibrary } from './exercise-library';

export interface TemplateRecommendation {
  template: WorkoutTemplate;
  score: number;
  reasons: string[];
  adaptations: string[];
}

export class TemplateSelector {
  /**
   * Get template recommendations based on user criteria
   */
  static getRecommendations(criteria: TemplateSelectionCriteria): TemplateRecommendation[] {
    const availableTemplates = WorkoutTemplates.getTemplatesForFrequency(criteria.frequency);
    
    if (availableTemplates.length === 0) {
      return [];
    }

    const recommendations = availableTemplates.map(template => 
      this.evaluateTemplate(template, criteria)
    );

    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Get the best template recommendation
   */
  static getBestRecommendation(criteria: TemplateSelectionCriteria): TemplateRecommendation | null {
    const recommendations = this.getRecommendations(criteria);
    return recommendations[0] || null;
  }

  /**
   * Evaluate how well a template matches the criteria
   */
  private static evaluateTemplate(
    template: WorkoutTemplate, 
    criteria: TemplateSelectionCriteria
  ): TemplateRecommendation {
    let score = 0;
    const reasons: string[] = [];
    const adaptations: string[] = [];

    // 1. Frequency match (40 points max)
    if (template.frequency === criteria.frequency) {
      score += 40;
      reasons.push(`Perfect match for ${criteria.frequency} days per week`);
    } else {
      const frequencyDiff = Math.abs(template.frequency - criteria.frequency);
      score += Math.max(0, 40 - (frequencyDiff * 10));
      adaptations.push(`Designed for ${template.frequency} days, can be adapted to ${criteria.frequency}`);
    }

    // 2. Experience level match (25 points max)
    const templateDifficulty = this.getTemplateDifficulty(template);
    if (templateDifficulty === criteria.experience_level) {
      score += 25;
      reasons.push(`Matches your ${criteria.experience_level} experience level`);
    } else {
      const levelScore = this.calculateExperienceLevelScore(templateDifficulty, criteria.experience_level);
      score += levelScore;
      if (levelScore > 0) {
        adaptations.push(`Can be adapted for ${criteria.experience_level} level`);
      }
    }

    // 3. Equipment availability (20 points max)
    const equipmentScore = this.calculateEquipmentScore(template, criteria.available_equipment);
    score += equipmentScore.score;
    if (equipmentScore.score > 15) {
      reasons.push('Uses equipment you have available');
    } else if (equipmentScore.score > 5) {
      adaptations.push('Some exercises may need equipment substitutions');
    }

    // 4. Time per session (10 points max)
    const estimatedDuration = this.estimateTemplateDuration(template);
    const timeDiff = Math.abs(estimatedDuration - criteria.time_per_session);
    const timeScore = Math.max(0, 10 - (timeDiff / 5)); // Lose 1 point per 5 minutes difference
    score += timeScore;
    
    if (timeDiff <= 10) {
      reasons.push(`Fits well within your ${criteria.time_per_session} minute sessions`);
    } else {
      adaptations.push(`Can be modified to fit ${criteria.time_per_session} minute sessions`);
    }

    // 5. Goals alignment (5 points max)
    const goalScore = this.calculateGoalScore(template, criteria.goals);
    score += goalScore;
    if (goalScore > 3) {
      reasons.push('Aligns well with your fitness goals');
    }

    return {
      template,
      score: Math.round(score),
      reasons,
      adaptations,
    };
  }

  /**
   * Calculate experience level compatibility score
   */
  private static calculateExperienceLevelScore(
    templateLevel: 'beginner' | 'intermediate' | 'advanced',
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): number {
    const levels = { beginner: 1, intermediate: 2, advanced: 3 };
    const templateValue = levels[templateLevel];
    const userValue = levels[userLevel];
    const diff = Math.abs(templateValue - userValue);

    if (diff === 0) return 25;
    if (diff === 1) return 15;
    return 5;
  }

  /**
   * Calculate equipment availability score
   */
  private static calculateEquipmentScore(
    template: WorkoutTemplate, 
    availableEquipment: Equipment[]
  ): { score: number; missingEquipment: Equipment[] } {
    const templateEquipment = [...new Set(template.exercises.map(e => e.equipment))];
    const availableCount = templateEquipment.filter(equipment => 
      availableEquipment.includes(equipment || 'none')
    ).length;
    
    const missingEquipment = templateEquipment.filter(equipment => 
      !availableEquipment.includes(equipment || 'none')
    ) as Equipment[];

    const score = (availableCount / templateEquipment.length) * 20;
    
    return { score, missingEquipment };
  }

  /**
   * Calculate goal alignment score
   */
  private static calculateGoalScore(template: WorkoutTemplate, goals: WorkoutGoal[]): number {
    if (goals.length === 0) return 5;

    let score = 0;
    const compoundExercises = template.exercises.filter(e => e.is_compound).length;
    const totalExercises = template.exercises.length;
    const compoundRatio = compoundExercises / totalExercises;

    goals.forEach(goal => {
      switch (goal) {
        case 'strength':
          // Strength benefits from compound movements and lower rep ranges
          if (compoundRatio > 0.6) score += 1;
          if (template.exercises.some(e => e.target_reps <= 6)) score += 1;
          break;
        case 'muscle-building':
          // Muscle building benefits from moderate rep ranges and variety
          if (template.exercises.some(e => e.target_reps >= 8 && e.target_reps <= 12)) score += 1;
          if (totalExercises >= 5) score += 1;
          break;
        case 'endurance':
          // Endurance benefits from higher rep ranges
          if (template.exercises.some(e => e.target_reps >= 12)) score += 1;
          break;
        case 'general-fitness':
          // General fitness benefits from balanced programs
          if (compoundRatio > 0.4 && compoundRatio < 0.8) score += 1;
          break;
        default:
          score += 0.5;
      }
    });

    return Math.min(5, score);
  }

  /**
   * Estimate template duration
   */
  private static estimateTemplateDuration(template: WorkoutTemplate): number {
    const totalSets = template.exercises.reduce((sum, exercise) => sum + exercise.target_sets, 0);
    const baseTime = totalSets * 2.5; // 2.5 minutes per set
    const warmupCooldown = 10;
    return Math.round(baseTime + warmupCooldown);
  }

  /**
   * Get template difficulty level
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
   * Generate equipment substitution suggestions
   */
  static generateEquipmentSubstitutions(
    template: WorkoutTemplate,
    availableEquipment: Equipment[]
  ): Array<{
    originalExercise: string;
    suggestions: Array<{
      slug: string;
      name_en: string;
      name_es: string;
      equipment: Equipment;
      reason: string;
    }>;
  }> {
    const substitutions: Array<{
      originalExercise: string;
      suggestions: Array<{
        slug: string;
        name_en: string;
        name_es: string;
        equipment: Equipment;
        reason: string;
      }>;
    }> = [];

    template.exercises.forEach(exercise => {
      if (!availableEquipment.includes(exercise.equipment || 'none')) {
        const alternatives = ExerciseLibrary.filterExercises({
          muscleGroups: exercise.muscle_groups,
          equipment: availableEquipment,
          difficulty: [exercise.difficulty_level],
        });

        const suggestions = alternatives
          .filter(alt => alt.slug !== exercise.slug)
          .slice(0, 3) // Top 3 alternatives
          .map(alt => ({
            slug: alt.slug,
            name_en: alt.name_en,
            name_es: alt.name_es,
            equipment: alt.equipment,
            reason: `Targets same muscle groups (${exercise.muscle_groups.join(', ')})`,
          }));

        if (suggestions.length > 0) {
          substitutions.push({
            originalExercise: exercise.slug,
            suggestions,
          });
        }
      }
    });

    return substitutions;
  }

  /**
   * Create a personalized template based on preferences
   */
  static createPersonalizedTemplate(
    baseTemplate: WorkoutTemplate,
    preferences: UserWorkoutPreferences
  ): WorkoutTemplate {
    let exercises = [...baseTemplate.exercises];

    // Filter out excluded exercises
    exercises = exercises.filter(
      exercise => !preferences.excluded_exercises.includes(exercise.slug)
    );

    // Replace exercises that require unavailable equipment
    exercises = exercises.map(exercise => {
      if (!preferences.preferred_equipment.includes(exercise.equipment || 'none')) {
        const alternatives = ExerciseLibrary.filterExercises({
          muscleGroups: exercise.muscle_groups,
          equipment: preferences.preferred_equipment,
          difficulty: [preferences.difficulty_preference],
        });

        if (alternatives.length > 0) {
          const alternative = alternatives[0];
          return {
            ...exercise,
            slug: alternative.slug,
            name_en: alternative.name_en,
            name_es: alternative.name_es,
            equipment: alternative.equipment,
          };
        }
      }
      return exercise;
    });

    // Adjust for difficulty preference
    exercises = exercises.map(exercise => {
      const adjustments = {
        beginner: { setsMultiplier: 0.8, repsAdjustment: -2 },
        intermediate: { setsMultiplier: 1.0, repsAdjustment: 0 },
        advanced: { setsMultiplier: 1.2, repsAdjustment: 2 },
      };

      const adjustment = adjustments[preferences.difficulty_preference];
      
      return {
        ...exercise,
        target_sets: Math.max(1, Math.round(exercise.target_sets * adjustment.setsMultiplier)),
        target_reps: Math.max(1, exercise.target_reps + adjustment.repsAdjustment),
        difficulty_level: preferences.difficulty_preference,
      };
    });

    return {
      ...baseTemplate,
      id: `${baseTemplate.id}-personalized`,
      name: `${baseTemplate.name} (Personalized)`,
      exercises,
    };
  }
}