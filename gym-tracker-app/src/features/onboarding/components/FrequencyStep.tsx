import React, { useState } from 'react';
import { Button } from '../../../components';
import type { OnboardingStepProps } from '../types';
import styles from './FrequencyStep.module.css';

interface FrequencyOption {
  days: number;
  title: string;
  description: string;
  commitment: string;
  recommended?: boolean;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    days: 1,
    title: '1 Day per Week',
    description: 'Full body workout',
    commitment: 'Light commitment'
  },
  {
    days: 2,
    title: '2 Days per Week',
    description: 'Upper/Lower split',
    commitment: 'Minimal commitment'
  },
  {
    days: 3,
    title: '3 Days per Week',
    description: 'Full body A/B/C rotation',
    commitment: 'Moderate commitment',
    recommended: true
  },
  {
    days: 4,
    title: '4 Days per Week',
    description: 'Upper/Lower split x2',
    commitment: 'Good commitment'
  },
  {
    days: 5,
    title: '5 Days per Week',
    description: 'Push/Pull/Legs split',
    commitment: 'High commitment'
  },
  {
    days: 6,
    title: '6 Days per Week',
    description: 'Push/Pull/Legs x2',
    commitment: 'Very high commitment'
  },
  {
    days: 7,
    title: '7 Days per Week',
    description: 'Daily training with varied intensity',
    commitment: 'Maximum commitment'
  }
];

export const FrequencyStep: React.FC<OnboardingStepProps> = ({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(
    data.trainingFrequency || null
  );

  const handleFrequencySelect = (days: number) => {
    setSelectedFrequency(days);
  };

  const handleNext = () => {
    if (selectedFrequency === null) return;

    onNext({
      trainingFrequency: selectedFrequency
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.heading}>How often do you want to train?</h2>
          <p className={styles.description}>
            Choose a frequency that fits your schedule and lifestyle. You can always adjust this later.
          </p>
        </div>

        <div className={styles.options}>
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.days}
              className={`${styles.option} ${
                selectedFrequency === option.days ? styles.selected : ''
              }`}
              onClick={() => handleFrequencySelect(option.days)}
            >
              <div className={styles.optionHeader}>
                <div className={styles.optionTitle}>
                  {option.title}
                  {option.recommended && (
                    <span className={styles.recommendedBadge}>Recommended</span>
                  )}
                </div>
                <div className={styles.optionCommitment}>{option.commitment}</div>
              </div>
              <div className={styles.optionDescription}>{option.description}</div>
              <div className={styles.optionCheck}>
                {selectedFrequency === option.days && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className={styles.note}>
          <p className={styles.noteText}>
            💡 <strong>New to fitness?</strong> We recommend starting with 3 days per week to build a sustainable routine.
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
          disabled={selectedFrequency === null}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};