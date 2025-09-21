import type { WorkoutTemplate, TemplateExercise } from '../types/workout';

// Predefined workout templates for different training frequencies
export const WORKOUT_TEMPLATES: Record<number, WorkoutTemplate[]> = {
  // 3 Days per week - Full Body A/B/C rotation
  3: [
    {
      id: 'full-body-3day-beginner',
      name: 'Full Body 3-Day Beginner',
      description: 'A balanced full-body routine perfect for beginners training 3 days per week',
      frequency: 3,
      type: 'full-body',
      exercises: [
        {
          slug: 'chest-press',
          name_en: 'Chest Press',
          name_es: 'Press de Pecho',
          target_sets: 3,
          target_reps: 10,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'machine',
          difficulty_level: 'beginner',
          is_compound: true,
        },
        {
          slug: 'seated-row',
          name_en: 'Seated Row',
          name_es: 'Remo Sentado',
          target_sets: 3,
          target_reps: 10,
          muscle_groups: ['back', 'biceps'],
          equipment: 'machine',
          difficulty_level: 'beginner',
          is_compound: true,
        },
        {
          slug: 'leg-press',
          name_en: 'Leg Press',
          name_es: 'Prensa de Piernas',
          target_sets: 3,
          target_reps: 12,
          muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
          equipment: 'machine',
          difficulty_level: 'beginner',
          is_compound: true,
        },
        {
          slug: 'shoulder-press',
          name_en: 'Shoulder Press',
          name_es: 'Press de Hombros',
          target_sets: 3,
          target_reps: 10,
          muscle_groups: ['shoulders', 'triceps'],
          equipment: 'machine',
          difficulty_level: 'beginner',
          is_compound: true,
        },
        {
          slug: 'leg-curl',
          name_en: 'Leg Curl',
          name_es: 'Curl de Piernas',
          target_sets: 3,
          target_reps: 12,
          muscle_groups: ['hamstrings'],
          equipment: 'machine',
          difficulty_level: 'beginner',
          is_compound: false,
        },
        {
          slug: 'plank',
          name_en: 'Plank',
          name_es: 'Plancha',
          target_sets: 3,
          target_reps: 30, // seconds
          muscle_groups: ['abs', 'obliques'],
          equipment: 'bodyweight',
          difficulty_level: 'beginner',
          is_compound: true,
        },
      ],
    },
  ],

  // 4 Days per week - Upper/Lower split
  4: [
    {
      id: 'upper-lower-4day',
      name: 'Upper/Lower 4-Day Split',
      description: 'Upper and lower body split routine for intermediate trainees',
      frequency: 4,
      type: 'upper-lower',
      exercises: [
        // Upper Body A
        {
          slug: 'chest-press',
          name_en: 'Chest Press',
          name_es: 'Press de Pecho',
          target_sets: 4,
          target_reps: 8,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'machine',
          difficulty_level: 'intermediate',
          is_compound: true,
        },
        {
          slug: 'seated-row',
          name_en: 'Seated Row',
          name_es: 'Remo Sentado',
          target_sets: 4,
          target_reps: 8,
          muscle_groups: ['back', 'biceps'],
          equipment: 'machine',
          difficulty_level: 'intermediate',
          is_compound: true,
        },
        {
          slug: 'shoulder-press',
          name_en: 'Shoulder Press',
          name_es: 'Press de Hombros',
          target_sets: 3,
          target_reps: 10,
          muscle_groups: ['shoulders', 'triceps'],
          equipment: 'machine',
          difficulty_level: 'intermediate',
          is_compound: true,
        },
        {
          slug: 'lat-pulldown',
          name_en: 'Lat Pulldown',
          name_es: 'Jalón al Pecho',
          target_sets: 3,
          target_reps: 10,
          muscle_groups: ['lats', 'biceps'],
          equipment: 'machine',
          difficulty_level: 'intermediate',
          is_compound: true,
        },
        {
          slug: 'bicep-curl',
          name_en: 'Bicep Curl',
          name_es: 'Curl de Bíceps',
          target_sets: 3,
          target_reps: 12,
          muscle_groups: ['biceps'],
          equipment: 'dumbbell',
          difficulty_level: 'intermediate',
          is_compound: false,
        },
        {
          slug: 'tricep-extension',
          name_en: 'Tricep Extension',
          name_es: 'Extensión de Tríceps',
          target_sets: 3,
          target_reps: 12,
          muscle_groups: ['triceps'],
          equipment: 'machine',
          difficulty_level: 'intermediate',
          is_compound: false,
        },
      ],
    },
  ],

  // 5 Days per week - Push/Pull/Legs split
  5: [
    {
      id: 'push-pull-legs-5day',
      name: 'Push/Pull/Legs 5-Day',
      description: 'Advanced push/pull/legs split for experienced trainees',
      frequency: 5,
      type: 'push-pull-legs',
      exercises: [
        // Push Day
        {
          slug: 'chest-press',
          name_en: 'Chest Press',
          name_es: 'Press de Pecho',
          target_sets: 4,
          target_reps: 6,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'machine',
          difficulty_level: 'advanced',
          is_compound: true,
        },
        {
          slug: 'dumbbell-bench-press',
          name_en: 'Dumbbell Bench Press',
          name_es: 'Press de Banca con Mancuernas',
          target_sets: 4,
          target_reps: 8,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'dumbbell',
          difficulty_level: 'advanced',
          is_compound: true,
        },
        {
          slug: 'shoulder-press',
          name_en: 'Shoulder Press',
          name_es: 'Press de Hombros',
          target_sets: 4,
          target_reps: 8,
          muscle_groups: ['shoulders', 'triceps'],
          equipment: 'machine',
          difficulty_level: 'advanced',
          is_compound: true,
        },
        {
          slug: 'lateral-raise',
          name_en: 'Lateral Raise',
          name_es: 'Elevación Lateral',
          target_sets: 3,
          target_reps: 12,
          muscle_groups: ['shoulders'],
          equipment: 'dumbbell',
          difficulty_level: 'advanced',
          is_compound: false,
        },
        {
          slug: 'tricep-extension',
          name_en: 'Tricep Extension',
          name_es: 'Extensión de Tríceps',
          target_sets: 4,
          target_reps: 10,
          muscle_groups: ['triceps'],
          equipment: 'machine',
          difficulty_level: 'advanced',
          is_compound: false,
        },
      ],
    },
  ],

  // 6 Days per week - Push/Pull/Legs x2
  6: [
    {
      id: 'push-pull-legs-6day',
      name: 'Push/Pull/Legs 6-Day',
      description: 'High-frequency push/pull/legs split for advanced trainees',
      frequency: 6,
      type: 'push-pull-legs',
      exercises: [
        // Similar to 5-day but with higher volume and frequency
        {
          slug: 'chest-press',
          name_en: 'Chest Press',
          name_es: 'Press de Pecho',
          target_sets: 5,
          target_reps: 6,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'machine',
          difficulty_level: 'advanced',
          is_compound: true,
        },
        {
          slug: 'dumbbell-bench-press',
          name_en: 'Dumbbell Bench Press',
          name_es: 'Press de Banca con Mancuernas',
          target_sets: 4,
          target_reps: 8,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'dumbbell',
          difficulty_level: 'advanced',
          is_compound: true,
        },
        {
          slug: 'push-ups',
          name_en: 'Push-ups',
          name_es: 'Flexiones',
          target_sets: 3,
          target_reps: 15,
          muscle_groups: ['chest', 'triceps', 'shoulders'],
          equipment: 'bodyweight',
          difficulty_level: 'advanced',
          is_compound: true,
        },
      ],
    },
  ],
};

// Template variations for different experience levels
export const TEMPLATE_VARIATIONS = {
  beginner: {
    sets_multiplier: 0.8,
    reps_range: [8, 12],
    compound_focus: true,
    isolation_limit: 2,
  },
  intermediate: {
    sets_multiplier: 1.0,
    reps_range: [6, 12],
    compound_focus: true,
    isolation_limit: 4,
  },
  advanced: {
    sets_multiplier: 1.2,
    reps_range: [4, 15],
    compound_focus: false,
    isolation_limit: 6,
  },
};

// Weekly schedule templates
export const WEEKLY_SCHEDULES = {
  3: {
    monday: { type: 'workout' as const, template_name: 'Full Body A' },
    tuesday: { type: 'rest' as const },
    wednesday: { type: 'workout' as const, template_name: 'Full Body B' },
    thursday: { type: 'rest' as const },
    friday: { type: 'workout' as const, template_name: 'Full Body C' },
    saturday: { type: 'rest' as const },
    sunday: { type: 'rest' as const },
  },
  4: {
    monday: { type: 'workout' as const, template_name: 'Upper A' },
    tuesday: { type: 'workout' as const, template_name: 'Lower A' },
    wednesday: { type: 'rest' as const },
    thursday: { type: 'workout' as const, template_name: 'Upper B' },
    friday: { type: 'workout' as const, template_name: 'Lower B' },
    saturday: { type: 'rest' as const },
    sunday: { type: 'rest' as const },
  },
  5: {
    monday: { type: 'workout' as const, template_name: 'Push' },
    tuesday: { type: 'workout' as const, template_name: 'Pull' },
    wednesday: { type: 'workout' as const, template_name: 'Legs' },
    thursday: { type: 'rest' as const },
    friday: { type: 'workout' as const, template_name: 'Push' },
    saturday: { type: 'workout' as const, template_name: 'Pull' },
    sunday: { type: 'rest' as const },
  },
  6: {
    monday: { type: 'workout' as const, template_name: 'Push' },
    tuesday: { type: 'workout' as const, template_name: 'Pull' },
    wednesday: { type: 'workout' as const, template_name: 'Legs' },
    thursday: { type: 'workout' as const, template_name: 'Push' },
    friday: { type: 'workout' as const, template_name: 'Pull' },
    saturday: { type: 'workout' as const, template_name: 'Legs' },
    sunday: { type: 'rest' as const },
  },
};

// Workout template utility class
export class WorkoutTemplates {
  static getTemplatesForFrequency(frequency: number): WorkoutTemplate[] {
    return WORKOUT_TEMPLATES[frequency] || [];
  }

  static getTemplateById(id: string): WorkoutTemplate | undefined {
    for (const templates of Object.values(WORKOUT_TEMPLATES)) {
      const template = templates.find(t => t.id === id);
      if (template) return template;
    }
    return undefined;
  }

  static getRecommendedTemplate(
    frequency: number,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ): WorkoutTemplate | undefined {
    const templates = this.getTemplatesForFrequency(frequency);
    
    // Simple recommendation logic based on frequency and experience
    if (frequency <= 3) {
      return templates.find(t => t.type === 'full-body');
    } else if (frequency <= 4) {
      return templates.find(t => t.type === 'upper-lower');
    } else {
      return templates.find(t => t.type === 'push-pull-legs');
    }
  }

  static customizeTemplate(
    template: WorkoutTemplate,
    customizations: {
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      availableEquipment?: string[];
      excludedExercises?: string[];
      targetDuration?: number;
    }
  ): WorkoutTemplate {
    const { experienceLevel = 'intermediate', availableEquipment, excludedExercises = [] } = customizations;
    
    let customizedExercises = template.exercises.filter(
      exercise => !excludedExercises.includes(exercise.slug)
    );

    // Filter by available equipment if specified
    if (availableEquipment && availableEquipment.length > 0) {
      customizedExercises = customizedExercises.filter(
        exercise => availableEquipment.includes(exercise.equipment || '')
      );
    }

    // Adjust sets and reps based on experience level
    const variation = TEMPLATE_VARIATIONS[experienceLevel];
    customizedExercises = customizedExercises.map(exercise => ({
      ...exercise,
      target_sets: Math.round(exercise.target_sets * variation.sets_multiplier),
      target_reps: Math.max(
        variation.reps_range[0],
        Math.min(variation.reps_range[1], exercise.target_reps)
      ),
    }));

    return {
      ...template,
      id: `${template.id}-custom`,
      name: `${template.name} (Custom)`,
      exercises: customizedExercises,
    };
  }

  static getWeeklySchedule(frequency: number) {
    return WEEKLY_SCHEDULES[frequency as keyof typeof WEEKLY_SCHEDULES];
  }
}