import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Date.now for consistent testing
const mockDateNow = vi.fn();
Date.now = mockDateNow;

describe('useWorkoutTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDateNow.mockReturnValue(1000000); // Fixed timestamp
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.startTime).toBe(null);
    expect(result.current.pausedTime).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
    expect(result.current.isActive).toBe(false);
  });

  it('should start timer correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.startTime).toBe(1000000);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.pausedTime).toBe(0);
    expect(result.current.isActive).toBe(true);
  });

  it('should update elapsed time when running', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    act(() => {
      result.current.start();
    });

    // Advance time by 5 seconds
    mockDateNow.mockReturnValue(1005000);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedTime).toBe(5);
    expect(result.current.formattedTime).toBe('00:05');
  });

  it('should pause timer correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    // Start timer
    act(() => {
      result.current.start();
    });

    // Advance time by 10 seconds
    mockDateNow.mockReturnValue(1010000);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Pause timer
    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(10);
    expect(result.current.isActive).toBe(true);
  });

  it('should resume timer correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    // Start, advance, and pause
    act(() => {
      result.current.start();
    });

    mockDateNow.mockReturnValue(1010000);
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.pause();
    });

    // Resume
    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isActive).toBe(true);

    // Advance more time
    mockDateNow.mockReturnValue(1015000);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedTime).toBe(15);
  });

  it('should stop timer correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    // Start and advance timer
    act(() => {
      result.current.start();
    });

    mockDateNow.mockReturnValue(1020000);
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(20);
    expect(result.current.isActive).toBe(true);
  });

  it('should reset timer correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    // Start, advance, and reset
    act(() => {
      result.current.start();
    });

    mockDateNow.mockReturnValue(1030000);
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.startTime).toBe(null);
    expect(result.current.pausedTime).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    act(() => {
      result.current.start();
    });

    // Test various time formats
    mockDateNow.mockReturnValue(1000000 + 65000); // 65 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.formattedTime).toBe('01:05');

    mockDateNow.mockReturnValue(1000000 + 3665000); // 1 hour, 1 minute, 5 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.formattedTime).toBe('01:01:05');
  });

  it('should save state to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer(123));

    act(() => {
      result.current.start();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'workout-timer-123',
      expect.stringContaining('"isRunning":true')
    );
  });

  it('should restore state from localStorage', () => {
    const savedState = {
      isRunning: false,
      elapsedTime: 120,
      startTime: 999000,
      pausedTime: 0,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
    
    const { result } = renderHook(() => useWorkoutTimer());

    expect(result.current.elapsedTime).toBe(120);
    expect(result.current.startTime).toBe(999000);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isActive).toBe(true);
  });

  it('should handle corrupted localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    const { result } = renderHook(() => useWorkoutTimer());

    // Should fall back to default state
    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.startTime).toBe(null);
  });

  it('should restore running timer after page refresh', () => {
    const startTime = 995000; // 5 seconds ago
    const savedState = {
      isRunning: true,
      elapsedTime: 0,
      startTime,
      pausedTime: 0,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
    mockDateNow.mockReturnValue(1000000); // Current time
    
    const { result } = renderHook(() => useWorkoutTimer());

    expect(result.current.isRunning).toBe(true);
    expect(result.current.elapsedTime).toBe(5); // Should calculate elapsed time
    expect(result.current.isActive).toBe(true);
  });

  it('should use workout-specific storage key', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer(456));

    act(() => {
      result.current.start();
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('workout-timer-456');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'workout-timer-456',
      expect.any(String)
    );
  });

  it('should use default storage key when no workoutId provided', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutTimer());

    act(() => {
      result.current.start();
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('workout-timer');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'workout-timer',
      expect.any(String)
    );
  });
});