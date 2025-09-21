import { supabase } from '../../../lib/supabase';
import { AuthService } from '../../../lib/auth';
import type { UserProfile } from '../../../types/common';
import type { ExportData, ExportOptions, ProfileFormData } from '../types';

export class SettingsService {
  // Profile management
  static async updateProfile(
    userId: string,
    profileData: ProfileFormData
  ): Promise<UserProfile> {
    try {
      // Update email if changed
      if (profileData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });
        
        if (emailError) {
          throw new Error(`Failed to update email: ${emailError.message}`);
        }
      }

      // Update profile data
      const updatedProfile = await AuthService.updateUserProfile(userId, {
        display_name: profileData.display_name,
      });

      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Preferences management
  static async updatePreferences(
    userId: string,
    preferences: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const updatedProfile = await AuthService.updateUserProfile(userId, preferences);
      
      if (!updatedProfile) {
        throw new Error('Failed to update preferences');
      }

      return updatedProfile;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Password management
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Data export functionality
  static async exportUserData(
    userId: string,
    options: ExportOptions
  ): Promise<ExportData> {
    try {
      const exportData: ExportData = {
        profile: {} as UserProfile,
        workouts: [],
        exercises: [],
        weightLogs: [],
        plans: [],
        exportedAt: new Date().toISOString(),
      };

      // Get user profile
      const profile = await AuthService.fetchUserProfile(userId);
      if (profile) {
        exportData.profile = profile;
      }

      // Get workouts if requested
      if (options.includeWorkouts) {
        let workoutsQuery = supabase
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          `)
          .eq('user_id', userId);

        // Apply date range filter if specified
        if (options.dateRange) {
          workoutsQuery = workoutsQuery
            .gte('date', options.dateRange.start)
            .lte('date', options.dateRange.end);
        }

        const { data: workouts, error: workoutsError } = await workoutsQuery;
        
        if (workoutsError) {
          console.error('Error fetching workouts:', workoutsError);
        } else {
          exportData.workouts = workouts || [];
          
          // Flatten exercises for easier export
          exportData.exercises = workouts?.flatMap(w => w.exercises || []) || [];
        }
      }

      // Get weight logs if requested
      if (options.includeWeightLogs) {
        let weightQuery = supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false });

        // Apply date range filter if specified
        if (options.dateRange) {
          weightQuery = weightQuery
            .gte('measured_at', options.dateRange.start)
            .lte('measured_at', options.dateRange.end);
        }

        const { data: weightLogs, error: weightError } = await weightQuery;
        
        if (weightError) {
          console.error('Error fetching weight logs:', weightError);
        } else {
          exportData.weightLogs = weightLogs || [];
        }
      }

      // Get plans if requested
      if (options.includePlans) {
        const { data: plans, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .eq('user_id', userId);
        
        if (plansError) {
          console.error('Error fetching plans:', plansError);
        } else {
          exportData.plans = plans || [];
        }
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Convert export data to downloadable format
  static formatExportData(data: ExportData, format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // For CSV, we'll create a simplified flat structure
    const csvData = {
      profile: [data.profile],
      workouts: data.workouts.map(w => ({
        id: w.id,
        date: w.date,
        title: w.title,
        is_completed: w.is_completed,
        duration_minutes: w.duration_minutes,
        notes: w.notes,
      })),
      weight_logs: data.weightLogs,
      plans: data.plans,
    };

    // Convert to CSV format (simplified)
    let csv = 'Export Data\n\n';
    
    Object.entries(csvData).forEach(([key, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        csv += `${key.toUpperCase()}\n`;
        
        // Headers
        const headers = Object.keys(items[0]);
        csv += headers.join(',') + '\n';
        
        // Data rows
        items.forEach(item => {
          const values = headers.map(header => {
            const value = item[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          });
          csv += values.join(',') + '\n';
        });
        
        csv += '\n';
      }
    });

    return csv;
  }

  // Download export data
  static downloadExportData(data: string, filename: string, format: 'json' | 'csv'): void {
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Account deletion
  static async deleteAccount(userId: string): Promise<void> {
    try {
      // Note: In a real implementation, you might want to soft-delete
      // or have a more complex deletion process
      
      // Delete user data (cascading deletes should handle related data)
      const { error: profileError } = await supabase
        .from('profile')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete auth user (this should be done last)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        throw new Error(`Failed to delete account: ${authError.message}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}