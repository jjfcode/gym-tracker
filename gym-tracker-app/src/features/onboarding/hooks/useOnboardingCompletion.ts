import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../../store';
import { useAuthStore } from '../../../store';
import type { OnboardingData } from '../types';
import { createUserProfile, createInitialWeightLog, createWorkoutPlan } from '../services/onboardingService';

export const useOnboardingCompletion = () => {
  const queryClient = useQueryClient();
  const { setIsOnboarding, setUnits } = useAppStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);

    try {
      // 1. Update user profile with preferences
      await createUserProfile({
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        units: data.units,
        locale: 'en', // Default to English, can be changed later
        theme: 'system' // Default theme
      });

      // 2. Create initial weight log
      await createInitialWeightLog({
        user_id: user.id,
        weight: data.weight,
        measured_at: new Date().toISOString().split('T')[0] // Today's date
      });

      // 3. Create workout plan and initial workouts
      if (data.selectedTemplate) {
        await createWorkoutPlan({
          user_id: user.id,
          template: data.selectedTemplate,
          startDate: new Date()
        });
      }

      // 4. Update app state
      setUnits(data.units);
      setIsOnboarding(false);

      // 5. Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });

    } catch (error) {
      console.error('Onboarding completion failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      // Additional success handling if needed
    },
    onError: (error) => {
      console.error('Onboarding mutation failed:', error);
    }
  });

  return {
    completeOnboarding: mutation.mutateAsync,
    isLoading: mutation.isPending || isLoading,
    error: mutation.error
  };
};