import React, { useState, useCallback } from 'react';
import { OnboardingLayout } from './OnboardingLayout';
import { WelcomeStep } from './WelcomeStep';
import { WeightInputStep } from './WeightInputStep';
import { FrequencyStep } from './FrequencyStep';
import { PlanPreviewStep } from './PlanPreviewStep';
import type { OnboardingData, OnboardingStep } from '../types';

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gym Tracker',
    description: 'Let\'s get you set up with a personalized workout plan',
    component: WelcomeStep
  },
  {
    id: 'weight',
    title: 'Your Current Weight',
    description: 'This helps us track your progress',
    component: WeightInputStep
  },
  {
    id: 'frequency',
    title: 'Training Frequency',
    description: 'How often do you want to work out?',
    component: FrequencyStep
  },
  {
    id: 'preview',
    title: 'Your Workout Plan',
    description: 'Review and confirm your personalized plan',
    component: PlanPreviewStep
  }
];

export const SimpleOnboardingFlow: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const StepComponent = currentStep.component;

  const handleNext = useCallback(async (stepData: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);

    if (currentStepIndex === ONBOARDING_STEPS.length - 1) {
      // Last step - for now just show completion message
      alert('Onboarding completed! Data: ' + JSON.stringify(updatedData, null, 2));
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, onboardingData]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={ONBOARDING_STEPS.length}
      title={currentStep.title}
      description={currentStep.description}
    >
      <StepComponent
        data={onboardingData}
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </OnboardingLayout>
  );
};