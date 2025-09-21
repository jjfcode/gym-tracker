import type { WorkoutTemplate } from '../types';

export const WORKOUT_TEMPLATES: Record<number, WorkoutTemplate> = {
  1: {
    id: '1-day',
    name: 'Full Body (1x/week)',
    description: 'Complete full body workout once per week',
    daysPerWeek: 1,
    workouts: [
      {
        name: 'Full Body',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads', 'glutes'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 3, target_reps: 10, muscle_groups: ['shoulders'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['hamstrings'] }
        ]
      }
    ]
  },
  2: {
    id: '2-day',
    name: 'Upper/Lower Split (2x/week)',
    description: 'Alternate between upper and lower body workouts',
    daysPerWeek: 2,
    workouts: [
      {
        name: 'Upper Body',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 3, target_reps: 10, muscle_groups: ['shoulders'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'tricep-extension', name_en: 'Tricep Extension', name_es: 'Extensión de Tríceps', target_sets: 3, target_reps: 12, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Lower Body',
        exercises: [
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads', 'glutes'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['hamstrings'] },
          { slug: 'calf-raise', name_en: 'Calf Raise', name_es: 'Elevación de Pantorrillas', target_sets: 3, target_reps: 15, muscle_groups: ['calves'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads'] },
          { slug: 'hip-abduction', name_en: 'Hip Abduction', name_es: 'Abducción de Cadera', target_sets: 3, target_reps: 15, muscle_groups: ['glutes'] }
        ]
      }
    ]
  },
  3: {
    id: '3-day',
    name: 'Full Body A/B/C (3x/week)',
    description: 'Three different full body workouts rotating throughout the week',
    daysPerWeek: 3,
    workouts: [
      {
        name: 'Full Body A',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads', 'glutes'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 3, target_reps: 10, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Full Body B',
        exercises: [
          { slug: 'incline-press', name_en: 'Incline Press', name_es: 'Press Inclinado', target_sets: 3, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['hamstrings'] },
          { slug: 'lateral-raise', name_en: 'Lateral Raise', name_es: 'Elevación Lateral', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Full Body C',
        exercises: [
          { slug: 'dips', name_en: 'Dips', name_es: 'Fondos', target_sets: 3, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'cable-row', name_en: 'Cable Row', name_es: 'Remo con Cable', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads'] },
          { slug: 'rear-delt-fly', name_en: 'Rear Delt Fly', name_es: 'Vuelo Posterior', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] }
        ]
      }
    ]
  },
  4: {
    id: '4-day',
    name: 'Upper/Lower Split (4x/week)',
    description: 'Upper and lower body workouts, each done twice per week',
    daysPerWeek: 4,
    workouts: [
      {
        name: 'Upper A',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 4, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 4, target_reps: 8, muscle_groups: ['back', 'biceps'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 3, target_reps: 10, muscle_groups: ['shoulders'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'tricep-extension', name_en: 'Tricep Extension', name_es: 'Extensión de Tríceps', target_sets: 3, target_reps: 12, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Lower A',
        exercises: [
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 4, target_reps: 10, muscle_groups: ['quads', 'glutes'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 4, target_reps: 10, muscle_groups: ['hamstrings'] },
          { slug: 'calf-raise', name_en: 'Calf Raise', name_es: 'Elevación de Pantorrillas', target_sets: 4, target_reps: 15, muscle_groups: ['calves'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads'] }
        ]
      },
      {
        name: 'Upper B',
        exercises: [
          { slug: 'incline-press', name_en: 'Incline Press', name_es: 'Press Inclinado', target_sets: 4, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'cable-row', name_en: 'Cable Row', name_es: 'Remo con Cable', target_sets: 4, target_reps: 8, muscle_groups: ['back', 'biceps'] },
          { slug: 'lateral-raise', name_en: 'Lateral Raise', name_es: 'Elevación Lateral', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] },
          { slug: 'bicep-curl', name_en: 'Bicep Curl', name_es: 'Curl de Bíceps', target_sets: 3, target_reps: 12, muscle_groups: ['biceps'] },
          { slug: 'dips', name_en: 'Dips', name_es: 'Fondos', target_sets: 3, target_reps: 8, muscle_groups: ['chest', 'triceps'] }
        ]
      },
      {
        name: 'Lower B',
        exercises: [
          { slug: 'squat', name_en: 'Squat', name_es: 'Sentadilla', target_sets: 4, target_reps: 10, muscle_groups: ['quads', 'glutes'] },
          { slug: 'romanian-deadlift', name_en: 'Romanian Deadlift', name_es: 'Peso Muerto Rumano', target_sets: 4, target_reps: 10, muscle_groups: ['hamstrings', 'glutes'] },
          { slug: 'hip-abduction', name_en: 'Hip Abduction', name_es: 'Abducción de Cadera', target_sets: 3, target_reps: 15, muscle_groups: ['glutes'] },
          { slug: 'walking-lunges', name_en: 'Walking Lunges', name_es: 'Zancadas Caminando', target_sets: 3, target_reps: 12, muscle_groups: ['quads', 'glutes'] }
        ]
      }
    ]
  },
  5: {
    id: '5-day',
    name: 'Push/Pull/Legs (5x/week)',
    description: 'Push, pull, and leg focused workouts with additional upper body day',
    daysPerWeek: 5,
    workouts: [
      {
        name: 'Push (Chest, Shoulders, Triceps)',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 4, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 4, target_reps: 8, muscle_groups: ['shoulders'] },
          { slug: 'incline-press', name_en: 'Incline Press', name_es: 'Press Inclinado', target_sets: 3, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'lateral-raise', name_en: 'Lateral Raise', name_es: 'Elevación Lateral', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] },
          { slug: 'tricep-extension', name_en: 'Tricep Extension', name_es: 'Extensión de Tríceps', target_sets: 3, target_reps: 12, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Pull (Back, Biceps)',
        exercises: [
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 4, target_reps: 8, muscle_groups: ['back', 'biceps'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 4, target_reps: 8, muscle_groups: ['back', 'biceps'] },
          { slug: 'cable-row', name_en: 'Cable Row', name_es: 'Remo con Cable', target_sets: 3, target_reps: 10, muscle_groups: ['back', 'biceps'] },
          { slug: 'bicep-curl', name_en: 'Bicep Curl', name_es: 'Curl de Bíceps', target_sets: 3, target_reps: 12, muscle_groups: ['biceps'] },
          { slug: 'rear-delt-fly', name_en: 'Rear Delt Fly', name_es: 'Vuelo Posterior', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Legs',
        exercises: [
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 4, target_reps: 10, muscle_groups: ['quads', 'glutes'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 4, target_reps: 10, muscle_groups: ['hamstrings'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 12, muscle_groups: ['quads'] },
          { slug: 'calf-raise', name_en: 'Calf Raise', name_es: 'Elevación de Pantorrillas', target_sets: 4, target_reps: 15, muscle_groups: ['calves'] },
          { slug: 'hip-abduction', name_en: 'Hip Abduction', name_es: 'Abducción de Cadera', target_sets: 3, target_reps: 15, muscle_groups: ['glutes'] }
        ]
      },
      {
        name: 'Push B',
        exercises: [
          { slug: 'dips', name_en: 'Dips', name_es: 'Fondos', target_sets: 4, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'arnold-press', name_en: 'Arnold Press', name_es: 'Press Arnold', target_sets: 4, target_reps: 10, muscle_groups: ['shoulders'] },
          { slug: 'chest-fly', name_en: 'Chest Fly', name_es: 'Vuelo de Pecho', target_sets: 3, target_reps: 12, muscle_groups: ['chest'] },
          { slug: 'front-raise', name_en: 'Front Raise', name_es: 'Elevación Frontal', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Pull B',
        exercises: [
          { slug: 'pull-ups', name_en: 'Pull-ups', name_es: 'Dominadas', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'face-pulls', name_en: 'Face Pulls', name_es: 'Jalones Faciales', target_sets: 4, target_reps: 12, muscle_groups: ['shoulders', 'back'] },
          { slug: 'hammer-curl', name_en: 'Hammer Curl', name_es: 'Curl Martillo', target_sets: 3, target_reps: 12, muscle_groups: ['biceps'] },
          { slug: 'shrugs', name_en: 'Shrugs', name_es: 'Encogimientos', target_sets: 3, target_reps: 12, muscle_groups: ['traps'] }
        ]
      }
    ]
  },
  6: {
    id: '6-day',
    name: 'Push/Pull/Legs x2 (6x/week)',
    description: 'Push, pull, and legs workouts done twice per week',
    daysPerWeek: 6,
    workouts: [
      {
        name: 'Push A',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 4, target_reps: 6, muscle_groups: ['chest', 'triceps'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 4, target_reps: 6, muscle_groups: ['shoulders'] },
          { slug: 'incline-press', name_en: 'Incline Press', name_es: 'Press Inclinado', target_sets: 3, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'lateral-raise', name_en: 'Lateral Raise', name_es: 'Elevación Lateral', target_sets: 4, target_reps: 12, muscle_groups: ['shoulders'] },
          { slug: 'tricep-extension', name_en: 'Tricep Extension', name_es: 'Extensión de Tríceps', target_sets: 4, target_reps: 10, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Pull A',
        exercises: [
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'cable-row', name_en: 'Cable Row', name_es: 'Remo con Cable', target_sets: 3, target_reps: 8, muscle_groups: ['back', 'biceps'] },
          { slug: 'bicep-curl', name_en: 'Bicep Curl', name_es: 'Curl de Bíceps', target_sets: 4, target_reps: 10, muscle_groups: ['biceps'] },
          { slug: 'rear-delt-fly', name_en: 'Rear Delt Fly', name_es: 'Vuelo Posterior', target_sets: 4, target_reps: 12, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Legs A',
        exercises: [
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 4, target_reps: 8, muscle_groups: ['quads', 'glutes'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 4, target_reps: 8, muscle_groups: ['hamstrings'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 10, muscle_groups: ['quads'] },
          { slug: 'calf-raise', name_en: 'Calf Raise', name_es: 'Elevación de Pantorrillas', target_sets: 4, target_reps: 15, muscle_groups: ['calves'] },
          { slug: 'hip-abduction', name_en: 'Hip Abduction', name_es: 'Abducción de Cadera', target_sets: 4, target_reps: 15, muscle_groups: ['glutes'] }
        ]
      },
      {
        name: 'Push B',
        exercises: [
          { slug: 'dips', name_en: 'Dips', name_es: 'Fondos', target_sets: 4, target_reps: 8, muscle_groups: ['chest', 'triceps'] },
          { slug: 'arnold-press', name_en: 'Arnold Press', name_es: 'Press Arnold', target_sets: 4, target_reps: 8, muscle_groups: ['shoulders'] },
          { slug: 'chest-fly', name_en: 'Chest Fly', name_es: 'Vuelo de Pecho', target_sets: 3, target_reps: 10, muscle_groups: ['chest'] },
          { slug: 'front-raise', name_en: 'Front Raise', name_es: 'Elevación Frontal', target_sets: 3, target_reps: 12, muscle_groups: ['shoulders'] },
          { slug: 'close-grip-press', name_en: 'Close Grip Press', name_es: 'Press Agarre Cerrado', target_sets: 3, target_reps: 10, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Pull B',
        exercises: [
          { slug: 'pull-ups', name_en: 'Pull-ups', name_es: 'Dominadas', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'face-pulls', name_en: 'Face Pulls', name_es: 'Jalones Faciales', target_sets: 4, target_reps: 12, muscle_groups: ['shoulders', 'back'] },
          { slug: 'hammer-curl', name_en: 'Hammer Curl', name_es: 'Curl Martillo', target_sets: 3, target_reps: 10, muscle_groups: ['biceps'] },
          { slug: 'shrugs', name_en: 'Shrugs', name_es: 'Encogimientos', target_sets: 3, target_reps: 12, muscle_groups: ['traps'] },
          { slug: 'preacher-curl', name_en: 'Preacher Curl', name_es: 'Curl Predicador', target_sets: 3, target_reps: 10, muscle_groups: ['biceps'] }
        ]
      },
      {
        name: 'Legs B',
        exercises: [
          { slug: 'squat', name_en: 'Squat', name_es: 'Sentadilla', target_sets: 4, target_reps: 8, muscle_groups: ['quads', 'glutes'] },
          { slug: 'romanian-deadlift', name_en: 'Romanian Deadlift', name_es: 'Peso Muerto Rumano', target_sets: 4, target_reps: 8, muscle_groups: ['hamstrings', 'glutes'] },
          { slug: 'walking-lunges', name_en: 'Walking Lunges', name_es: 'Zancadas Caminando', target_sets: 3, target_reps: 10, muscle_groups: ['quads', 'glutes'] },
          { slug: 'seated-calf-raise', name_en: 'Seated Calf Raise', name_es: 'Elevación Sentado', target_sets: 4, target_reps: 15, muscle_groups: ['calves'] },
          { slug: 'glute-bridge', name_en: 'Glute Bridge', name_es: 'Puente de Glúteos', target_sets: 3, target_reps: 15, muscle_groups: ['glutes'] }
        ]
      }
    ]
  },
  7: {
    id: '7-day',
    name: 'Daily Training (7x/week)',
    description: 'Daily training with varied intensity and focus',
    daysPerWeek: 7,
    workouts: [
      {
        name: 'Push Heavy',
        exercises: [
          { slug: 'chest-press', name_en: 'Chest Press', name_es: 'Press de Pecho', target_sets: 5, target_reps: 5, muscle_groups: ['chest', 'triceps'] },
          { slug: 'shoulder-press', name_en: 'Shoulder Press', name_es: 'Press de Hombros', target_sets: 4, target_reps: 6, muscle_groups: ['shoulders'] },
          { slug: 'incline-press', name_en: 'Incline Press', name_es: 'Press Inclinado', target_sets: 4, target_reps: 6, muscle_groups: ['chest', 'triceps'] },
          { slug: 'tricep-extension', name_en: 'Tricep Extension', name_es: 'Extensión de Tríceps', target_sets: 3, target_reps: 8, muscle_groups: ['triceps'] }
        ]
      },
      {
        name: 'Pull Heavy',
        exercises: [
          { slug: 'seated-row', name_en: 'Seated Row', name_es: 'Remo Sentado', target_sets: 5, target_reps: 5, muscle_groups: ['back', 'biceps'] },
          { slug: 'lat-pulldown', name_en: 'Lat Pulldown', name_es: 'Jalón al Pecho', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'cable-row', name_en: 'Cable Row', name_es: 'Remo con Cable', target_sets: 4, target_reps: 6, muscle_groups: ['back', 'biceps'] },
          { slug: 'bicep-curl', name_en: 'Bicep Curl', name_es: 'Curl de Bíceps', target_sets: 3, target_reps: 8, muscle_groups: ['biceps'] }
        ]
      },
      {
        name: 'Legs Heavy',
        exercises: [
          { slug: 'leg-press', name_en: 'Leg Press', name_es: 'Prensa de Piernas', target_sets: 5, target_reps: 5, muscle_groups: ['quads', 'glutes'] },
          { slug: 'leg-curl', name_en: 'Leg Curl', name_es: 'Curl de Piernas', target_sets: 4, target_reps: 6, muscle_groups: ['hamstrings'] },
          { slug: 'calf-raise', name_en: 'Calf Raise', name_es: 'Elevación de Pantorrillas', target_sets: 4, target_reps: 12, muscle_groups: ['calves'] },
          { slug: 'leg-extension', name_en: 'Leg Extension', name_es: 'Extensión de Piernas', target_sets: 3, target_reps: 8, muscle_groups: ['quads'] }
        ]
      },
      {
        name: 'Push Volume',
        exercises: [
          { slug: 'dips', name_en: 'Dips', name_es: 'Fondos', target_sets: 4, target_reps: 10, muscle_groups: ['chest', 'triceps'] },
          { slug: 'lateral-raise', name_en: 'Lateral Raise', name_es: 'Elevación Lateral', target_sets: 4, target_reps: 15, muscle_groups: ['shoulders'] },
          { slug: 'chest-fly', name_en: 'Chest Fly', name_es: 'Vuelo de Pecho', target_sets: 3, target_reps: 12, muscle_groups: ['chest'] },
          { slug: 'front-raise', name_en: 'Front Raise', name_es: 'Elevación Frontal', target_sets: 3, target_reps: 15, muscle_groups: ['shoulders'] }
        ]
      },
      {
        name: 'Pull Volume',
        exercises: [
          { slug: 'face-pulls', name_en: 'Face Pulls', name_es: 'Jalones Faciales', target_sets: 4, target_reps: 15, muscle_groups: ['shoulders', 'back'] },
          { slug: 'hammer-curl', name_en: 'Hammer Curl', name_es: 'Curl Martillo', target_sets: 4, target_reps: 12, muscle_groups: ['biceps'] },
          { slug: 'rear-delt-fly', name_en: 'Rear Delt Fly', name_es: 'Vuelo Posterior', target_sets: 4, target_reps: 15, muscle_groups: ['shoulders'] },
          { slug: 'shrugs', name_en: 'Shrugs', name_es: 'Encogimientos', target_sets: 3, target_reps: 12, muscle_groups: ['traps'] }
        ]
      },
      {
        name: 'Legs Volume',
        exercises: [
          { slug: 'walking-lunges', name_en: 'Walking Lunges', name_es: 'Zancadas Caminando', target_sets: 4, target_reps: 15, muscle_groups: ['quads', 'glutes'] },
          { slug: 'hip-abduction', name_en: 'Hip Abduction', name_es: 'Abducción de Cadera', target_sets: 4, target_reps: 20, muscle_groups: ['glutes'] },
          { slug: 'seated-calf-raise', name_en: 'Seated Calf Raise', name_es: 'Elevación Sentado', target_sets: 4, target_reps: 20, muscle_groups: ['calves'] },
          { slug: 'glute-bridge', name_en: 'Glute Bridge', name_es: 'Puente de Glúteos', target_sets: 3, target_reps: 20, muscle_groups: ['glutes'] }
        ]
      },
      {
        name: 'Active Recovery',
        exercises: [
          { slug: 'light-cardio', name_en: 'Light Cardio', name_es: 'Cardio Ligero', target_sets: 1, target_reps: 20, muscle_groups: ['cardio'] },
          { slug: 'stretching', name_en: 'Stretching', name_es: 'Estiramiento', target_sets: 1, target_reps: 10, muscle_groups: ['flexibility'] },
          { slug: 'foam-rolling', name_en: 'Foam Rolling', name_es: 'Rodillo de Espuma', target_sets: 1, target_reps: 10, muscle_groups: ['recovery'] },
          { slug: 'mobility-work', name_en: 'Mobility Work', name_es: 'Trabajo de Movilidad', target_sets: 1, target_reps: 10, muscle_groups: ['mobility'] }
        ]
      }
    ]
  }
};

export const getWorkoutTemplate = (daysPerWeek: number): WorkoutTemplate | null => {
  return WORKOUT_TEMPLATES[daysPerWeek] || null;
};

export const getAllTemplates = (): WorkoutTemplate[] => {
  return Object.values(WORKOUT_TEMPLATES);
};