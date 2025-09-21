import React, { useMemo } from 'react';
import { Button } from '../../../components';
import type { OnboardingStepProps } from '../types';
import { getWorkoutTemplate } from '../data/workoutTemplates';
// import { useAppStore } from '../../../store';
import styles from './PlanPreviewStep.module.css';

export const PlanPreviewStep: React.FC<OnboardingStepProps> = ({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep
}) => {
  // const { language } = useAppStore();
  const language = 'en'; // Default to English for now
  
  const template = useMemo(() => {
    if (!data.trainingFrequency) return null;
    return getWorkoutTemplate(data.trainingFrequency);
  }, [data.trainingFrequency]);

  const handleNext = () => {
    onNext({
      selectedTemplate: template || undefined
    });
  };

  const getExerciseName = (exercise: any) => {
    return language === 'es' ? exercise.name_es : exercise.name_en;
  };

  const formatWeight = (weight?: number, units?: 'metric' | 'imperial') => {
    if (!weight) return '';
    const unit = units === 'metric' ? 'kg' : 'lbs';
    return `${weight} ${unit}`;
  };

  if (!template) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>
            <h2>Unable to generate plan</h2>
            <p>Please go back and select a training frequency.</p>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Your Workout Plan</h2>
          <p className={styles.description}>
            Here's your personalized {template.daysPerWeek}-day workout plan. 
            You can customize exercises later in the app.
          </p>
        </div>

        <div className={styles.planSummary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Training Frequency</span>
              <span className={styles.summaryValue}>{template.daysPerWeek} days/week</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Current Weight</span>
              <span className={styles.summaryValue}>{formatWeight(data.weight, data.units)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Plan Type</span>
              <span className={styles.summaryValue}>{template.name}</span>
            </div>
          </div>
        </div>

        <div className={styles.workouts}>
          <h3 className={styles.workoutsHeading}>Weekly Workout Schedule</h3>
          <div className={styles.workoutsList}>
            {template.workouts.map((workout, index) => (
              <div key={index} className={styles.workout}>
                <div className={styles.workoutHeader}>
                  <h4 className={styles.workoutName}>{workout.name}</h4>
                  <span className={styles.exerciseCount}>
                    {workout.exercises.length} exercises
                  </span>
                </div>
                <div className={styles.exercises}>
                  {workout.exercises.slice(0, 4).map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className={styles.exercise}>
                      <span className={styles.exerciseName}>
                        {getExerciseName(exercise)}
                      </span>
                      <span className={styles.exerciseDetails}>
                        {exercise.target_sets} × {exercise.target_reps}
                      </span>
                    </div>
                  ))}
                  {workout.exercises.length > 4 && (
                    <div className={styles.moreExercises}>
                      +{workout.exercises.length - 4} more exercises
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.note}>
          <p className={styles.noteText}>
            🎯 <strong>Ready to start?</strong> Your first workout will be scheduled for tomorrow. 
            You can always modify exercises and add your own later.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button 
          variant="ghost" 
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          size="lg"
        >
          Create My Plan
        </Button>
      </div>
    </div>
  );
};