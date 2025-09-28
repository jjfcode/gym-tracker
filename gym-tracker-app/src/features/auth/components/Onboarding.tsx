import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { useAuth } from '../useAuth';
import { supabase } from '../../../lib/supabase';
import styles from './Onboarding.module.css';

interface OnboardingData {
  full_name: string;
  weight?: number;
  height?: number;
  fitness_goal: string;
  experience_level: string;
  workout_frequency: number;
  units: 'metric' | 'imperial';
}

const Onboarding: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    fitness_goal: '',
    experience_level: '',
    workout_frequency: 3,
    units: 'imperial', // Default to imperial
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      console.log('Starting onboarding completion...');
      
      try {
        // Update profile with retries
        let profileUpdateSuccess = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!profileUpdateSuccess && attempts < maxAttempts) {
          attempts++;
          console.log(`Profile update attempt ${attempts}/${maxAttempts}`);

          try {
            const { data: profileData, error } = await supabase
              .from('profile')
              .update({
                display_name: data.full_name,
                units: data.units,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user!.id)
              .select()
              .single();

            if (error) {
              console.error('Profile update error:', error);
              
              // If profile doesn't exist, try to create it
              if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
                console.log('Profile not found, creating new profile...');
                const { error: createError } = await supabase
                  .from('profile')
                  .insert({
                    user_id: user!.id,
                    display_name: data.full_name,
                    units: data.units,
                    locale: 'en',
                    theme: 'system',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });

                if (!createError) {
                  profileUpdateSuccess = true;
                  console.log('Profile created successfully');
                } else {
                  console.error('Profile creation failed:', createError);
                  if (attempts === maxAttempts) {
                    throw new Error(`Profile creation failed after ${maxAttempts} attempts: ${createError.message}`);
                  }
                }
              } else {
                if (attempts === maxAttempts) {
                  throw new Error(`Profile update failed after ${maxAttempts} attempts: ${error.message}`);
                }
              }
            } else {
              profileUpdateSuccess = true;
              console.log('Profile updated successfully:', profileData);
            }
          } catch (error) {
            console.error(`Profile update attempt ${attempts} failed:`, error);
            if (attempts === maxAttempts) {
              throw new Error(`Profile update failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Try to log initial weight if provided (with timeout)
        if (data.weight) {
          try {
            const weightInsertPromise = supabase
              .from('weight_logs')
              .insert({
                user_id: user!.id,
                measured_at: new Date().toISOString(),
                weight: data.weight,
                note: 'Initial weight from onboarding',
              });

            const weightTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Weight insert timeout')), 5000)
            );

            const result = await Promise.race([
              weightInsertPromise,
              weightTimeoutPromise
            ]) as { error?: Error | null };
            const weightError = result.error;

            if (weightError) {
              console.warn('Weight logging failed, but continuing:', weightError);
            } else {
              console.log('Weight logged successfully');
            }
          } catch (error) {
            console.warn('Weight logging timed out or failed, but continuing:', error);
          }
        }

        // Create workout plan based on user preferences
        try {
          console.log('Creating workout plan based on preferences...');
          
          // Import the necessary services and templates
          const { WORKOUT_TEMPLATES } = await import('../../onboarding/data/workoutTemplates');
          const { createWorkoutPlan } = await import('../../onboarding/services/onboardingService');
          
          // Get the template for the selected frequency
          const template = WORKOUT_TEMPLATES[data.workout_frequency];

          if (!template) {
            console.warn('No suitable workout template found for frequency:', data.workout_frequency);
          } else {
            console.log('Selected workout template:', template.name);
            console.log('Template details:', {
              daysPerWeek: template.daysPerWeek,
              workouts: template.workouts.length,
              fitnessGoal: data.fitness_goal,
              experience: data.experience_level
            });

            // Create the workout plan starting from next Monday (or tomorrow if today is Monday)
            const today = new Date();
            const nextMonday = new Date(today);
            const daysUntilMonday = (7 - today.getDay() + 1) % 7;
            nextMonday.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));

            await createWorkoutPlan({
              user_id: user!.id,
              template: template,
              startDate: nextMonday
            });

            console.log('🎉 Workout plan created successfully!');
            console.log(`📅 Plan starts: ${nextMonday.toDateString()}`);
            console.log(`💪 Training frequency: ${template.daysPerWeek} days/week`);
            console.log(`🎯 Fitness goal: ${data.fitness_goal}`);
            console.log(`📊 Experience level: ${data.experience_level}`);
            console.log('🗓️ Your workout calendar is now ready! Check the Planning tab to see your schedule.');
          }
        } catch (error) {
          console.error('Failed to create workout plan:', error);
          // Don't fail onboarding if workout plan creation fails, but let user know
          console.warn('Workout plan creation failed, but profile setup completed successfully');
        }

        console.log('Onboarding completion finished successfully');
        return data;
      } catch (error) {
        console.error('Onboarding completion failed:', error);
        throw error; // Don't continue silently, let the error bubble up
      }
    },
    onSuccess: async () => {
      console.log('🎉 Onboarding completed successfully!');
      
      // Force refresh the auth context to pick up the updated profile
      try {
        await refreshProfile();
        console.log('✅ Profile refreshed after onboarding completion');
      } catch (error) {
        console.warn('Failed to refresh profile after onboarding:', error);
      }
      
      // Show success message
      console.log('🚀 Redirecting to dashboard...');
      console.log('💡 Your personalized workout plan is ready in the Planning section!');
      
      // Small delay to allow profile to be updated in auth context
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    },
    onError: (error) => {
      console.error('Onboarding mutation failed:', error);
      // Show user the error instead of silently continuing
      alert(`Profile setup failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
    },
  });

  const handleInputChange = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('Starting onboarding with data:', formData);
      completeOnboardingMutation.mutate(formData);
      
      // Fallback: if mutation doesn't complete in 15 seconds, navigate anyway
      setTimeout(() => {
        if (completeOnboardingMutation.isPending) {
          console.warn('Onboarding taking too long, navigating to dashboard anyway');
          navigate('/dashboard');
        }
      }, 15000);
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
          <div className={styles['stepContent']}>
            <h2>Welcome to Gym Tracker!</h2>
            <p>Let's set up your profile to personalize your experience.</p>
            
            <div className={styles['formGroup']}>
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

            <div className={styles['formGroup']}>
              <label htmlFor="weight">Current Weight (optional)</label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                placeholder={formData.units === 'imperial' ? 'Weight in lbs' : 'Weight in kg'}
              />
            </div>

            <div className={styles['formGroup']}>
              <label htmlFor="height">Height (optional)</label>
              <Input
                id="height"
                type="number"
                value={formData.height || ''}
                onChange={(e) => handleInputChange('height', Number(e.target.value))}
                placeholder={formData.units === 'imperial' ? 'Height in inches' : 'Height in cm'}
              />
            </div>

            <div className={styles['formGroup']}>
              <label>Unit System</label>
              <div className={styles['optionGrid']}>
                <button
                  type="button"
                  className={`${styles['optionCard']} ${
                    formData.units === 'imperial' ? styles['selected'] : ''
                  }`}
                  onClick={() => handleInputChange('units', 'imperial')}
                >
                  <span className={styles['optionLabel']}>Imperial</span>
                  <span className={styles['optionDesc']}>lbs, inches, °F</span>
                </button>
                <button
                  type="button"
                  className={`${styles['optionCard']} ${
                    formData.units === 'metric' ? styles['selected'] : ''
                  }`}
                  onClick={() => handleInputChange('units', 'metric')}
                >
                  <span className={styles['optionLabel']}>Metric</span>
                  <span className={styles['optionDesc']}>kg, cm, °C</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles['stepContent']}>
            <h2>Your Fitness Goals</h2>
            <p>What's your primary fitness goal?</p>
            
            <div className={styles['optionGrid']}>
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
                  className={`${styles['optionCard']} ${
                    formData.fitness_goal === goal.value ? styles['selected'] : ''
                  }`}
                  onClick={() => handleInputChange('fitness_goal', goal.value)}
                >
                  <span className={styles['optionIcon']}>{goal.icon}</span>
                  <span className={styles['optionLabel']}>{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles['stepContent']}>
            <h2>Experience & Schedule</h2>
            <p>Tell us about your fitness experience and workout schedule. We'll create a personalized workout plan for you!</p>
            
            <div className={styles['formGroup']}>
              <label>Experience Level</label>
              <div className={styles['optionGrid']}>
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to fitness' },
                  { value: 'intermediate', label: 'Intermediate', desc: '6+ months experience' },
                  { value: 'advanced', label: 'Advanced', desc: '2+ years experience' },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    className={`${styles['optionCard']} ${
                      formData.experience_level === level.value ? styles['selected'] : ''
                    }`}
                    onClick={() => handleInputChange('experience_level', level.value)}
                  >
                    <span className={styles['optionLabel']}>{level.label}</span>
                    <span className={styles['optionDesc']}>{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles['formGroup']}>
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
                className={styles['slider']}
              />
              <div className={styles['sliderLabels']}>
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
    <div className={styles['container']}>
      <Card className={styles['onboardingCard']}>
        <div className={styles['header']}>
          <div className={styles['progressBar']}>
            <div 
              className={styles['progressFill']}
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className={styles['stepIndicator']}>Step {step} of 3</span>
        </div>

        {renderStep()}

        <div className={styles['actions']}>
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
              ? 'Creating your personalized workout plan...'
              : step === 3
              ? 'Complete Setup & Create Plan'
              : 'Next'
            }
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;