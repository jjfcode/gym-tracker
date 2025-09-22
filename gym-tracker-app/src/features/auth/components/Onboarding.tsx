import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { useAuth } from '../AuthContext';
import { supabase } from '../../../lib/supabase';
import styles from './Onboarding.module.css';

interface OnboardingData {
  full_name: string;
  weight?: number;
  height?: number;
  fitness_goal: string;
  experience_level: string;
  workout_frequency: number;
}

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    fitness_goal: '',
    experience_level: '',
    workout_frequency: 3,
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profile')
        .update({
          display_name: data.full_name,
          // Add other profile fields as needed
        })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      // Log initial weight if provided
      if (data.weight) {
        const { error: weightError } = await supabase
          .from('weight_logs')
          .insert({
            user_id: user!.id,
            measured_at: new Date().toISOString(),
            weight: data.weight,
            note: 'Initial weight from onboarding',
          });

        if (weightError) throw weightError;
      }

      return data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const handleInputChange = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboardingMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>Welcome to Gym Tracker!</h2>
            <p>Let's set up your profile to personalize your experience.</p>
            
            <div className={styles.formGroup}>
              <label htmlFor="full_name">Full Name</label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="weight">Current Weight (optional)</label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                placeholder="Weight in kg"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="height">Height (optional)</label>
              <Input
                id="height"
                type="number"
                value={formData.height || ''}
                onChange={(e) => handleInputChange('height', Number(e.target.value))}
                placeholder="Height in cm"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>Your Fitness Goals</h2>
            <p>What's your primary fitness goal?</p>
            
            <div className={styles.optionGrid}>
              {[
                { value: 'weight_loss', label: 'Weight Loss', icon: '📉' },
                { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
                { value: 'strength', label: 'Strength', icon: '🏋️' },
                { value: 'endurance', label: 'Endurance', icon: '🏃' },
                { value: 'general_fitness', label: 'General Fitness', icon: '🎯' },
              ].map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  className={`${styles.optionCard} ${
                    formData.fitness_goal === goal.value ? styles.selected : ''
                  }`}
                  onClick={() => handleInputChange('fitness_goal', goal.value)}
                >
                  <span className={styles.optionIcon}>{goal.icon}</span>
                  <span className={styles.optionLabel}>{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>Experience & Schedule</h2>
            <p>Tell us about your fitness experience and workout schedule.</p>
            
            <div className={styles.formGroup}>
              <label>Experience Level</label>
              <div className={styles.optionGrid}>
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to fitness' },
                  { value: 'intermediate', label: 'Intermediate', desc: '6+ months experience' },
                  { value: 'advanced', label: 'Advanced', desc: '2+ years experience' },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    className={`${styles.optionCard} ${
                      formData.experience_level === level.value ? styles.selected : ''
                    }`}
                    onClick={() => handleInputChange('experience_level', level.value)}
                  >
                    <span className={styles.optionLabel}>{level.label}</span>
                    <span className={styles.optionDesc}>{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="workout_frequency">
                Workouts per week: {formData.workout_frequency}
              </label>
              <input
                id="workout_frequency"
                type="range"
                min="1"
                max="7"
                value={formData.workout_frequency}
                onChange={(e) => handleInputChange('workout_frequency', Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>1</span>
                <span>7</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.onboardingCard}>
        <div className={styles.header}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className={styles.stepIndicator}>Step {step} of 3</span>
        </div>

        {renderStep()}

        <div className={styles.actions}>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={completeOnboardingMutation.isPending}
            >
              Back
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={
              completeOnboardingMutation.isPending ||
              (step === 1 && !formData.full_name) ||
              (step === 2 && !formData.fitness_goal) ||
              (step === 3 && !formData.experience_level)
            }
          >
            {completeOnboardingMutation.isPending
              ? 'Setting up...'
              : step === 3
              ? 'Complete Setup'
              : 'Next'
            }
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;