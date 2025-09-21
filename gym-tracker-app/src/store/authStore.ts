import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../types/auth';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // Start with loading true to check for existing session
  isAuthenticated: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(set => ({
    ...initialState,

    // Actions
    setUser: (user: AuthUser | null) =>
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      }),

    setLoading: (isLoading: boolean) => set({ isLoading }),

    setError: (error: string | null) =>
      set({
        error,
        isLoading: false,
      }),

    clearError: () => set({ error: null }),

    reset: () => set(initialState),
  }))
);

// Selectors for better performance
export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);