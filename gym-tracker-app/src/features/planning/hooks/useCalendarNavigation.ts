import { useState, useCallback } from 'react';
import { 
  getWeekStart, 
  getPreviousWeek, 
  getNextWeek, 
  getPreviousMonth, 
  getNextMonth 
} from '../utils/calendarUtils';
import type { CalendarNavigation } from '../types';

/**
 * Hook for managing calendar navigation state and actions
 */
export const useCalendarNavigation = (
  initialDate: Date = new Date(),
  initialViewMode: 'week' | 'month' = 'week'
): CalendarNavigation => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<'week' | 'month'>(initialViewMode);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prevDate => {
      if (viewMode === 'week') {
        return getPreviousWeek(prevDate);
      } else {
        const { year, month } = getPreviousMonth(prevDate.getFullYear(), prevDate.getMonth());
        return new Date(year, month, 1);
      }
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prevDate => {
      if (viewMode === 'week') {
        return getNextWeek(prevDate);
      } else {
        const { year, month } = getNextMonth(prevDate.getFullYear(), prevDate.getMonth());
        return new Date(year, month, 1);
      }
    });
  }, [viewMode]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSetViewMode = useCallback((mode: 'week' | 'month') => {
    setViewMode(mode);
    
    // Adjust current date based on view mode
    if (mode === 'week') {
      // Ensure we're at the start of the week
      setCurrentDate(prevDate => getWeekStart(prevDate));
    } else {
      // Ensure we're at the start of the month
      setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), 1));
    }
  }, []);

  return {
    currentDate,
    viewMode,
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
    setViewMode: handleSetViewMode,
  };
};