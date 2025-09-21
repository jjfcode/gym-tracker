import { useState, useEffect, useCallback, useRef } from 'react';

export interface WorkoutTimerState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  startTime: number | null;
  pausedTime: number;
}

export interface WorkoutTimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export interface UseWorkoutTimerReturn extends WorkoutTimerState, WorkoutTimerActions {
  formattedTime: string;
  isActive: boolean;
}

/**
 * Custom hook for workout timer functionality
 * Provides start, pause, resume, stop, and reset functionality
 * Persists timer state in localStorage for recovery after page refresh
 */
export const useWorkoutTimer = (workoutId?: number): UseWorkoutTimerReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = workoutId ? `workout-timer-${workoutId}` : 'workout-timer';

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.isRunning && parsed.startTime) {
          // Calculate elapsed time since page was refreshed
          const now = Date.now();
          const elapsed = Math.floor((now - parsed.startTime - parsed.pausedTime) / 1000);
          setElapsedTime(Math.max(0, elapsed));
          setIsRunning(true);
          setStartTime(parsed.startTime);
          setPausedTime(parsed.pausedTime);
        } else {
          setElapsedTime(parsed.elapsedTime || 0);
          setIsRunning(false);
          setStartTime(parsed.startTime);
          setPausedTime(parsed.pausedTime || 0);
        }
      } catch (error) {
        console.warn('Failed to parse saved timer state:', error);
      }
    }
  }, [storageKey]);

  // Save timer state to localStorage
  const saveTimerState = useCallback((state: Partial<WorkoutTimerState>) => {
    const currentState = {
      isRunning,
      elapsedTime,
      startTime,
      pausedTime,
      ...state,
    };
    localStorage.setItem(storageKey, JSON.stringify(currentState));
  }, [storageKey, isRunning, elapsedTime, startTime, pausedTime]);

  // Update elapsed time when timer is running
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime - pausedTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, pausedTime]);

  // Save state whenever it changes
  useEffect(() => {
    saveTimerState({});
  }, [isRunning, elapsedTime, startTime, pausedTime, saveTimerState]);

  const start = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setPausedTime(0);
    setElapsedTime(0);
  }, []);

  const pause = useCallback(() => {
    if (isRunning && startTime) {
      const now = Date.now();
      const currentPausedTime = pausedTime + (now - startTime - (elapsedTime * 1000));
      setPausedTime(currentPausedTime);
      setIsRunning(false);
    }
  }, [isRunning, startTime, pausedTime, elapsedTime]);

  const resume = useCallback(() => {
    if (!isRunning && startTime) {
      setIsRunning(true);
    }
  }, [isRunning, startTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    // Keep the elapsed time but mark as stopped
    saveTimerState({ isRunning: false });
  }, [saveTimerState]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setPausedTime(0);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Format time as HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = formatTime(elapsedTime);
  const isActive = startTime !== null;

  return {
    isRunning,
    elapsedTime,
    startTime,
    pausedTime,
    formattedTime,
    isActive,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};

/**
 * Hook for rest timer between sets
 */
export const useRestTimer = (defaultRestTime: number = 90): UseWorkoutTimerReturn & {
  restTime: number;
  setRestTime: (time: number) => void;
  startRest: () => void;
  isRestComplete: boolean;
} => {
  const [restTime, setRestTime] = useState(defaultRestTime);
  const timer = useWorkoutTimer();
  
  const startRest = useCallback(() => {
    timer.reset();
    timer.start();
  }, [timer]);

  const isRestComplete = timer.elapsedTime >= restTime;

  return {
    ...timer,
    restTime,
    setRestTime,
    startRest,
    isRestComplete,
  };
};