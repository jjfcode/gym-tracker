export interface OnboardingData {
  weight: number;
  units: 'metric' | 'imperial';
  trainingFrequency: number; // 1-7 days per week
  selectedTemplate?: WorkoutTemplate;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>;
  onNext: (stepData: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  workouts: WorkoutTemplateDay[];
}

export interface WorkoutTemplateDay {
  name: string;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  slug: string;
  name_en: string;
  name_es: string;
  target_sets: number;
  target_reps: number;
  muscle_groups: string[];
  equipment?: string;
}