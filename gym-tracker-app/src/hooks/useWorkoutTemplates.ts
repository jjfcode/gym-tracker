import { useMemo } from 'react';
import type { 
  WorkoutTemplate, 
  TemplateSelectionCriteria, 
  UserWorkoutPreferences 
} from '../types/workout';
import { 
  WorkoutTemplates, 
  TemplateSelector, 
  TemplateCustomizer,
  type TemplateRecommendation,
  type CustomizationOptions
} from '../lib';

export function useWorkoutTemplates() {
  const getTemplatesForFrequency = (frequency: number): WorkoutTemplate[] => {
    return WorkoutTemplates.getTemplatesForFrequency(frequency);
  };

  const getTemplateById = (id: string): WorkoutTemplate | undefined => {
    return WorkoutTemplates.getTemplateById(id);
  };

  const getRecommendedTemplate = (
    frequency: number,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ): WorkoutTemplate | undefined => {
    return WorkoutTemplates.getRecommendedTemplate(frequency, experienceLevel);
  };

  return {
    getTemplatesForFrequency,
    getTemplateById,
    getRecommendedTemplate,
  };
}

export function useTemplateSelector() {
  const getRecommendations = (criteria: TemplateSelectionCriteria): TemplateRecommendation[] => {
    return TemplateSelector.getRecommendations(criteria);
  };

  const getBestRecommendation = (criteria: TemplateSelectionCriteria): TemplateRecommendation | null => {
    return TemplateSelector.getBestRecommendation(criteria);
  };

  const generateEquipmentSubstitutions = (
    template: WorkoutTemplate,
    availableEquipment: string[]
  ) => {
    return TemplateSelector.generateEquipmentSubstitutions(template, availableEquipment as any);
  };

  const createPersonalizedTemplate = (
    baseTemplate: WorkoutTemplate,
    preferences: UserWorkoutPreferences
  ): WorkoutTemplate => {
    return TemplateSelector.createPersonalizedTemplate(baseTemplate, preferences);
  };

  return {
    getRecommendations,
    getBestRecommendation,
    generateEquipmentSubstitutions,
    createPersonalizedTemplate,
  };
}

export function useTemplateCustomizer() {
  const customizeTemplate = (
    baseTemplate: WorkoutTemplate,
    options: CustomizationOptions
  ): WorkoutTemplate => {
    return TemplateCustomizer.customizeTemplate(baseTemplate, options);
  };

  const validateTemplate = (template: WorkoutTemplate) => {
    return TemplateCustomizer.validateTemplate(template);
  };

  const generateExerciseSuggestions = (
    currentTemplate: WorkoutTemplate,
    criteria?: Parameters<typeof TemplateCustomizer.generateExerciseSuggestions>[1]
  ) => {
    return TemplateCustomizer.generateExerciseSuggestions(currentTemplate, criteria);
  };

  const createGoalVariations = (baseTemplate: WorkoutTemplate) => {
    return TemplateCustomizer.createGoalVariations(baseTemplate);
  };

  return {
    customizeTemplate,
    validateTemplate,
    generateExerciseSuggestions,
    createGoalVariations,
  };
}

export function useTemplateRecommendations(criteria: TemplateSelectionCriteria) {
  const recommendations = useMemo(() => {
    return TemplateSelector.getRecommendations(criteria);
  }, [
    criteria.frequency,
    criteria.experience_level,
    criteria.available_equipment.join(','),
    criteria.time_per_session,
    criteria.goals.join(','),
  ]);

  const bestRecommendation = useMemo(() => {
    return recommendations[0] || null;
  }, [recommendations]);

  return {
    recommendations,
    bestRecommendation,
    hasRecommendations: recommendations.length > 0,
  };
}