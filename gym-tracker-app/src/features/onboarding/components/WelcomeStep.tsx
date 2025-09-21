import React from 'react';
import { Button } from '../../../components';
import type { OnboardingStepProps } from '../types';
import styles from './WelcomeStep.module.css';

export const WelcomeStep: React.FC<OnboardingStepProps> = ({
  onNext,
  isFirstStep,
  isLastStep
}) => {
  const handleNext = () => {
    onNext({});
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          💪
        </div>
        
        <h2 className={styles.heading}>Welcome to Gym Tracker!</h2>
        
        <p className={styles.description}>
          Let's get you set up with a personalized workout plan. We'll ask you a few quick questions 
          to create the perfect training routine for your goals and schedule.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📊</span>
            <span className={styles.featureText}>Track your progress</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎯</span>
            <span className={styles.featureText}>Personalized workouts</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📱</span>
            <span className={styles.featureText}>Works offline</span>
          </div>
        </div>

        <p className={styles.timeEstimate}>
          This setup will take about 2 minutes.
        </p>
      </div>

      <div className={styles.actions}>
        <Button 
          onClick={handleNext}
          size="lg"
          fullWidth
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};