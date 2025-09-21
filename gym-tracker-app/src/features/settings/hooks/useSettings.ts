import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { useAppStore } from '../../../store/appStore';
import { SettingsService } from '../services/settingsService';
import type { 
  ProfileFormData, 
  PreferencesFormData, 
  PasswordFormData,
  ExportOptions,
  SettingsSection 
} from '../types';

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { theme, language, units, setTheme, setLanguage, setUnits } = useAppStore();
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [error, setError] = useState<string | null>(null);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      return SettingsService.updateProfile(user.id, data);
    },
    onSuccess: (updatedProfile) => {
      // Update auth context with new profile data
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    },
  });

  // Preferences update mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Update local store immediately for better UX
      setTheme(data.theme);
      setLanguage(data.language);
      setUnits(data.units);
      
      return SettingsService.updatePreferences(user.id, {
        theme: data.theme,
        locale: data.language,
        units: data.units,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return SettingsService.updatePassword(data.newPassword);
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    },
  });

  // Data export mutation
  const exportDataMutation = useMutation({
    mutationFn: async (options: ExportOptions) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const exportData = await SettingsService.exportUserData(user.id, options);
      const formattedData = SettingsService.formatExportData(exportData, options.format);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `gym-tracker-export-${timestamp}`;
      
      SettingsService.downloadExportData(formattedData, filename, options.format);
      
      return exportData;
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to export data');
    },
  });

  // Clear error
  const clearError = () => setError(null);

  return {
    // State
    activeSection,
    setActiveSection,
    error,
    clearError,
    
    // Current preferences
    currentPreferences: {
      theme,
      language,
      units,
    },
    
    // Mutations
    updateProfile: updateProfileMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    exportData: exportDataMutation.mutate,
    
    // Loading states
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isExportingData: exportDataMutation.isPending,
    
    // Success states
    profileUpdateSuccess: updateProfileMutation.isSuccess,
    preferencesUpdateSuccess: updatePreferencesMutation.isSuccess,
    passwordUpdateSuccess: updatePasswordMutation.isSuccess,
    exportSuccess: exportDataMutation.isSuccess,
  };
}