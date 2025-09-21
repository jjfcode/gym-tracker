import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es';
export type Units = 'metric' | 'imperial';

interface AppState {
  // User preferences
  theme: Theme;
  language: Language;
  units: Units;

  // UI state
  isOnboarding: boolean;
  activeWorkout: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setUnits: (units: Units) => void;
  setIsOnboarding: (isOnboarding: boolean) => void;
  setActiveWorkout: (workoutId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      // Initial state
      theme: 'system',
      language: 'en',
      units: 'imperial',
      isOnboarding: true,
      activeWorkout: null,

      // Actions
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      setUnits: units => set({ units }),
      setIsOnboarding: isOnboarding => set({ isOnboarding }),
      setActiveWorkout: activeWorkout => set({ activeWorkout }),
    }),
    {
      name: 'gym-tracker-app-store',
      partialize: state => ({
        theme: state.theme,
        language: state.language,
        units: state.units,
        isOnboarding: state.isOnboarding,
      }),
    }
  )
);
