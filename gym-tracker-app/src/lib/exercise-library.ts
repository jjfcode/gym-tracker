import type { ExerciseLibraryItem, MuscleGroup, Equipment } from '../types/workout';

// Comprehensive exercise library with predefined exercises
export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Chest Exercises
  {
    slug: 'chest-press',
    name_en: 'Chest Press',
    name_es: 'Press de Pecho',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'machine',
    instructions_en: 'Sit on the chest press machine with your back flat against the pad. Grip the handles and press forward until your arms are extended.',
    instructions_es: 'Siéntate en la máquina de press de pecho con la espalda plana contra el respaldo. Agarra las manijas y empuja hacia adelante hasta extender los brazos.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'dumbbell-bench-press',
    name_en: 'Dumbbell Bench Press',
    name_es: 'Press de Banca con Mancuernas',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'dumbbell',
    instructions_en: 'Lie on a bench holding dumbbells at chest level. Press the weights up until your arms are extended.',
    instructions_es: 'Acuéstate en un banco sosteniendo mancuernas a la altura del pecho. Empuja los pesos hacia arriba hasta extender los brazos.',
    difficulty_level: 'intermediate',
    is_compound: true,
  },
  {
    slug: 'push-ups',
    name_en: 'Push-ups',
    name_es: 'Flexiones',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'bodyweight',
    instructions_en: 'Start in a plank position. Lower your body until your chest nearly touches the floor, then push back up.',
    instructions_es: 'Comienza en posición de plancha. Baja el cuerpo hasta que el pecho casi toque el suelo, luego empuja hacia arriba.',
    difficulty_level: 'beginner',
    is_compound: true,
  },

  // Back Exercises
  {
    slug: 'seated-row',
    name_en: 'Seated Row',
    name_es: 'Remo Sentado',
    muscle_groups: ['back', 'biceps', 'rhomboids'],
    equipment: 'machine',
    instructions_en: 'Sit at the rowing machine with your chest against the pad. Pull the handles toward your torso, squeezing your shoulder blades.',
    instructions_es: 'Siéntate en la máquina de remo con el pecho contra el respaldo. Tira de las manijas hacia el torso, apretando los omóplatos.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'lat-pulldown',
    name_en: 'Lat Pulldown',
    name_es: 'Jalón al Pecho',
    muscle_groups: ['lats', 'biceps', 'rhomboids'],
    equipment: 'machine',
    instructions_en: 'Sit at the lat pulldown machine. Pull the bar down to your upper chest while keeping your torso upright.',
    instructions_es: 'Siéntate en la máquina de jalón. Tira de la barra hacia el pecho superior manteniendo el torso erguido.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'pull-ups',
    name_en: 'Pull-ups',
    name_es: 'Dominadas',
    muscle_groups: ['lats', 'biceps', 'rhomboids'],
    equipment: 'pull-up-bar',
    instructions_en: 'Hang from a pull-up bar with palms facing away. Pull your body up until your chin clears the bar.',
    instructions_es: 'Cuélgate de una barra con las palmas hacia afuera. Tira del cuerpo hacia arriba hasta que la barbilla pase la barra.',
    difficulty_level: 'advanced',
    is_compound: true,
  },

  // Leg Exercises
  {
    slug: 'leg-press',
    name_en: 'Leg Press',
    name_es: 'Prensa de Piernas',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'machine',
    instructions_en: 'Sit in the leg press machine with feet shoulder-width apart. Lower the weight until your knees reach 90 degrees, then press back up.',
    instructions_es: 'Siéntate en la máquina de prensa con los pies separados al ancho de hombros. Baja el peso hasta que las rodillas lleguen a 90 grados, luego empuja hacia arriba.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'squats',
    name_en: 'Squats',
    name_es: 'Sentadillas',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'bodyweight',
    instructions_en: 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, then return to standing.',
    instructions_es: 'Párate con los pies separados al ancho de hombros. Baja el cuerpo como si te sentaras en una silla, luego regresa a la posición inicial.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'leg-extension',
    name_en: 'Leg Extension',
    name_es: 'Extensión de Piernas',
    muscle_groups: ['quadriceps'],
    equipment: 'machine',
    instructions_en: 'Sit on the leg extension machine. Extend your legs until they are straight, then lower with control.',
    instructions_es: 'Siéntate en la máquina de extensión de piernas. Extiende las piernas hasta que estén rectas, luego baja con control.',
    difficulty_level: 'beginner',
    is_compound: false,
  },
  {
    slug: 'leg-curl',
    name_en: 'Leg Curl',
    name_es: 'Curl de Piernas',
    muscle_groups: ['hamstrings'],
    equipment: 'machine',
    instructions_en: 'Lie face down on the leg curl machine. Curl your heels toward your glutes, then lower with control.',
    instructions_es: 'Acuéstate boca abajo en la máquina de curl de piernas. Lleva los talones hacia los glúteos, luego baja con control.',
    difficulty_level: 'beginner',
    is_compound: false,
  },

  // Shoulder Exercises
  {
    slug: 'shoulder-press',
    name_en: 'Shoulder Press',
    name_es: 'Press de Hombros',
    muscle_groups: ['shoulders', 'triceps'],
    equipment: 'machine',
    instructions_en: 'Sit with your back against the pad. Press the handles overhead until your arms are extended.',
    instructions_es: 'Siéntate con la espalda contra el respaldo. Empuja las manijas por encima de la cabeza hasta extender los brazos.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'lateral-raise',
    name_en: 'Lateral Raise',
    name_es: 'Elevación Lateral',
    muscle_groups: ['shoulders'],
    equipment: 'dumbbell',
    instructions_en: 'Hold dumbbells at your sides. Raise them out to the sides until they reach shoulder height.',
    instructions_es: 'Sostén mancuernas a los lados. Levántalas hacia los lados hasta que lleguen a la altura de los hombros.',
    difficulty_level: 'beginner',
    is_compound: false,
  },

  // Arm Exercises
  {
    slug: 'bicep-curl',
    name_en: 'Bicep Curl',
    name_es: 'Curl de Bíceps',
    muscle_groups: ['biceps'],
    equipment: 'dumbbell',
    instructions_en: 'Hold dumbbells with arms at your sides. Curl the weights up toward your shoulders, then lower with control.',
    instructions_es: 'Sostén mancuernas con los brazos a los lados. Lleva los pesos hacia los hombros, luego baja con control.',
    difficulty_level: 'beginner',
    is_compound: false,
  },
  {
    slug: 'tricep-extension',
    name_en: 'Tricep Extension',
    name_es: 'Extensión de Tríceps',
    muscle_groups: ['triceps'],
    equipment: 'machine',
    instructions_en: 'Sit at the tricep extension machine. Extend your arms downward, then return to the starting position.',
    instructions_es: 'Siéntate en la máquina de extensión de tríceps. Extiende los brazos hacia abajo, luego regresa a la posición inicial.',
    difficulty_level: 'beginner',
    is_compound: false,
  },

  // Core Exercises
  {
    slug: 'plank',
    name_en: 'Plank',
    name_es: 'Plancha',
    muscle_groups: ['abs', 'obliques'],
    equipment: 'bodyweight',
    instructions_en: 'Hold a push-up position with your body in a straight line from head to heels.',
    instructions_es: 'Mantén una posición de flexión con el cuerpo en línea recta desde la cabeza hasta los talones.',
    difficulty_level: 'beginner',
    is_compound: true,
  },
  {
    slug: 'crunches',
    name_en: 'Crunches',
    name_es: 'Abdominales',
    muscle_groups: ['abs'],
    equipment: 'bodyweight',
    instructions_en: 'Lie on your back with knees bent. Lift your shoulders off the ground by contracting your abs.',
    instructions_es: 'Acuéstate boca arriba con las rodillas dobladas. Levanta los hombros del suelo contrayendo los abdominales.',
    difficulty_level: 'beginner',
    is_compound: false,
  },
];

// Exercise library utility functions
export class ExerciseLibrary {
  static getAll(): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY;
  }

  static getBySlug(slug: string): ExerciseLibraryItem | undefined {
    return EXERCISE_LIBRARY.find(exercise => exercise.slug === slug);
  }

  static getByMuscleGroup(muscleGroup: MuscleGroup): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY.filter(exercise => 
      exercise.muscle_groups.includes(muscleGroup)
    );
  }

  static getByEquipment(equipment: Equipment): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY.filter(exercise => 
      exercise.equipment === equipment
    );
  }

  static getByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY.filter(exercise => 
      exercise.difficulty_level === difficulty
    );
  }

  static getCompoundExercises(): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY.filter(exercise => exercise.is_compound);
  }

  static search(query: string, locale: 'en' | 'es' = 'en'): ExerciseLibraryItem[] {
    const searchTerm = query.toLowerCase();
    return EXERCISE_LIBRARY.filter(exercise => {
      const name = locale === 'en' ? exercise.name_en : exercise.name_es;
      return name.toLowerCase().includes(searchTerm) ||
             exercise.muscle_groups.some(group => group.includes(searchTerm)) ||
             exercise.equipment.includes(searchTerm);
    });
  }

  static filterExercises(criteria: {
    muscleGroups?: MuscleGroup[];
    equipment?: Equipment[];
    difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
    compoundOnly?: boolean;
  }): ExerciseLibraryItem[] {
    return EXERCISE_LIBRARY.filter(exercise => {
      if (criteria.muscleGroups && criteria.muscleGroups.length > 0) {
        const hasMatchingMuscleGroup = criteria.muscleGroups.some(group =>
          exercise.muscle_groups.includes(group)
        );
        if (!hasMatchingMuscleGroup) return false;
      }

      if (criteria.equipment && criteria.equipment.length > 0) {
        if (!criteria.equipment.includes(exercise.equipment)) return false;
      }

      if (criteria.difficulty && criteria.difficulty.length > 0) {
        if (!criteria.difficulty.includes(exercise.difficulty_level)) return false;
      }

      if (criteria.compoundOnly && !exercise.is_compound) return false;

      return true;
    });
  }
}