import { describe, it, expect } from 'vitest';
import { ExerciseLibrary } from '../exercise-library';
import { WorkoutTemplates } from '../workout-templates';
import { WorkoutGenerator } from '../workout-generator';
import { TemplateSelector } from '../template-selector';
import { TemplateCustomizer } from '../template-customizer';
import type { TemplateSelectionCriteria, UserWorkoutPreferences } from '../../types/workout';

describe('Workout System Integration', () => {
  describe('ExerciseLibrary', () => {
    it('should return all exercises', () => {
      const exercises = ExerciseLibrary.getAll();
      expect(exercises.length).toBeGreaterThan(0);
      expect(exercises[0]).toHaveProperty('slug');
      expect(exercises[0]).toHaveProperty('name_en');
      expect(exercises[0]).toHaveProperty('muscle_groups');
    });

    it('should find exercise by slug', () => {
      const exercise = ExerciseLibrary.getBySlug('chest-press');
      expect(exercise).toBeDefined();
      expect(exercise?.name_en).toBe('Chest Press');
    });

    it('should filter exercises by muscle group', () => {
      const chestExercises = ExerciseLibrary.getByMuscleGroup('chest');
      expect(chestExercises.length).toBeGreaterThan(0);
      chestExercises.forEach(exercise => {
        expect(exercise.muscle_groups).toContain('chest');
      });
    });

    it('should search exercises', () => {
      const results = ExerciseLibrary.search('press');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(exercise => {
        expect(exercise.name_en.toLowerCase()).toContain('press');
      });
    });
  });

  describe('WorkoutTemplates', () => {
    it('should return templates for frequency', () => {
      const templates = WorkoutTemplates.getTemplatesForFrequency(3);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].frequency).toBe(3);
    });

    it('should find template by id', () => {
      const template = WorkoutTemplates.getTemplateById('full-body-3day-beginner');
      expect(template).toBeDefined();
      expect(template?.name).toContain('Full Body');
    });

    it('should get recommended template', () => {
      const template = WorkoutTemplates.getRecommendedTemplate(3, 'beginner');
      expect(template).toBeDefined();
      expect(template?.type).toBe('full-body');
    });
  });

  describe('WorkoutGenerator', () => {
    it('should generate workout plan', () => {
      const template = WorkoutTemplates.getTemplateById('full-body-3day-beginner');
      expect(template).toBeDefined();

      const preferences: UserWorkoutPreferences = {
        goal_days_per_week: 3,
        preferred_equipment: ['machine', 'bodyweight'],
        excluded_exercises: [],
        difficulty_preference: 'beginner',
        workout_duration_minutes: 60,
        rest_days: ['sunday'],
      };

      const workouts = WorkoutGenerator.generateWorkoutPlan({
        template: template!,
        user_preferences: preferences,
        start_date: '2024-01-01',
        weeks_to_generate: 1,
      });

      expect(workouts.length).toBeGreaterThan(0);
      expect(workouts[0]).toHaveProperty('date');
      expect(workouts[0]).toHaveProperty('exercises');
    });

    it('should select template based on criteria', () => {
      const criteria: TemplateSelectionCriteria = {
        frequency: 3,
        experience_level: 'beginner',
        available_equipment: ['machine', 'bodyweight'],
        time_per_session: 60,
        goals: ['general-fitness'],
      };

      const template = WorkoutGenerator.selectTemplate(criteria);
      expect(template).toBeDefined();
      expect(template?.frequency).toBe(3);
    });
  });

  describe('TemplateSelector', () => {
    it('should provide recommendations', () => {
      const criteria: TemplateSelectionCriteria = {
        frequency: 3,
        experience_level: 'beginner',
        available_equipment: ['machine', 'bodyweight'],
        time_per_session: 60,
        goals: ['general-fitness'],
      };

      const recommendations = TemplateSelector.getRecommendations(criteria);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('template');
      expect(recommendations[0]).toHaveProperty('score');
      expect(recommendations[0]).toHaveProperty('reasons');
    });

    it('should get best recommendation', () => {
      const criteria: TemplateSelectionCriteria = {
        frequency: 3,
        experience_level: 'beginner',
        available_equipment: ['machine', 'bodyweight'],
        time_per_session: 60,
        goals: ['general-fitness'],
      };

      const recommendation = TemplateSelector.getBestRecommendation(criteria);
      expect(recommendation).toBeDefined();
      expect(recommendation?.score).toBeGreaterThan(0);
    });
  });

  describe('TemplateCustomizer', () => {
    it('should customize template', () => {
      const baseTemplate = WorkoutTemplates.getTemplateById('full-body-3day-beginner');
      expect(baseTemplate).toBeDefined();

      const customized = TemplateCustomizer.customizeTemplate(baseTemplate!, {
        name: 'Custom Template',
        globalAdjustments: {
          setsMultiplier: 1.2,
          repsAdjustment: 2,
        },
      });

      expect(customized.name).toBe('Custom Template');
      expect(customized.id).toContain('custom');
      expect(customized.exercises.length).toBeGreaterThan(0);
    });

    it('should validate template', () => {
      const template = WorkoutTemplates.getTemplateById('full-body-3day-beginner');
      expect(template).toBeDefined();

      const validation = TemplateCustomizer.validateTemplate(template!);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should generate exercise suggestions', () => {
      const template = WorkoutTemplates.getTemplateById('full-body-3day-beginner');
      expect(template).toBeDefined();

      const suggestions = TemplateCustomizer.generateExerciseSuggestions(template!, {
        maxSuggestions: 3,
      });

      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('exercise');
        expect(suggestion).toHaveProperty('reason');
        expect(suggestion).toHaveProperty('priority');
      });
    });
  });
});