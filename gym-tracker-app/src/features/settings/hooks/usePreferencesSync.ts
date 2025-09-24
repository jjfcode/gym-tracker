import { useEffect } from 'react';
import { useAuth } from '../../auth';
import { useAppStore } from '../../../store/appStore';
import { SettingsService } from '../services/settingsService';

/**
 * Hook to sync preferences between local store and database
 * This ensures preferences are synchronized across devices
 */
export function usePreferencesSync() {
  const { user } = useAuth();
  const { theme, language, units, setTheme, setLanguage, setUnits } = useAppStore();

  // Sync local preferences with user profile when user changes
  useEffect(() => {
    if (user?.profile) {
      const { theme: profileTheme, locale, units: profileUnits } = user.profile;
      
      // Only update if different to avoid unnecessary re-renders
      if (profileTheme !== theme) {
        setTheme(profileTheme);
      }
      
      if (locale !== language) {
        setLanguage(locale);
      }
      
      if (profileUnits !== units) {
        setUnits(profileUnits);
      }
    }
  }, [user?.profile, theme, language, units, setTheme, setLanguage, setUnits]);

  // Sync preferences to database when they change locally
  useEffect(() => {
    if (user?.id && user.profile) {
      const hasChanges = 
        user.profile.theme !== theme ||
        user.profile.locale !== language ||
        user.profile.units !== units;

      if (hasChanges) {
        // Debounce the sync to avoid too many API calls
        const timeoutId = setTimeout(async () => {
          try {
            await SettingsService.updatePreferences(user.id, {
              theme,
              locale: language,
              units,
            });
          } catch (error) {
            console.error('Failed to sync preferences:', error);
          }
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [user?.id, user?.profile, theme, language, units]);

  return {
    isSynced: user?.profile ? (
      user.profile.theme === theme &&
      user.profile.locale === language &&
      user.profile.units === units
    ) : false,
  };
}