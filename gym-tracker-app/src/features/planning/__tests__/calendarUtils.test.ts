import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  formatDateString,
  parseDate,
  isSameDay,
  isToday,
  getWeekDays,
  getCalendarMonth,
  getPreviousWeek,
  getNextWeek,
  getPreviousMonth,
  getNextMonth,
  getDayNames,
  getWorkoutStatus,
  formatDisplayDate,
  getWeekRangeString,
} from '../utils/calendarUtils';

describe('Calendar Utils', () => {
  describe('getWeekStart', () => {
    it('should return Monday for a date in the middle of the week', () => {
      const wednesday = new Date(2024, 0, 3); // Wednesday, Jan 3, 2024
      const weekStart = getWeekStart(wednesday);
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(formatDateString(weekStart)).toBe('2024-01-01');
    });

    it('should return the same date if it is already Monday', () => {
      const monday = new Date(2024, 0, 1); // Monday, Jan 1, 2024
      const weekStart = getWeekStart(monday);
      expect(formatDateString(weekStart)).toBe('2024-01-01');
    });

    it('should handle Sunday correctly', () => {
      const sunday = new Date(2024, 0, 7); // Sunday, Jan 7, 2024
      const weekStart = getWeekStart(sunday);
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(formatDateString(weekStart)).toBe('2024-01-01');
    });
  });

  describe('getWeekEnd', () => {
    it('should return Sunday for any date in the week', () => {
      const wednesday = new Date(2024, 0, 3); // Wednesday, Jan 3, 2024
      const weekEnd = getWeekEnd(wednesday);
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(formatDateString(weekEnd)).toBe('2024-01-07');
    });
  });

  describe('formatDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 3); // Jan 3, 2024
      expect(formatDateString(date)).toBe('2024-01-03');
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const dateString = '2024-01-03';
      const date = parseDate(dateString);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(3);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same dates', () => {
      const date1 = new Date(2024, 0, 3, 10, 0, 0);
      const date2 = new Date(2024, 0, 3, 15, 0, 0);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const date1 = new Date(2024, 0, 3);
      const date2 = new Date(2024, 0, 4);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('getWeekDays', () => {
    it('should return 7 days starting from the given date', () => {
      const startDate = new Date(2024, 0, 1); // Monday, Jan 1, 2024
      const weekDays = getWeekDays(startDate);
      
      expect(weekDays).toHaveLength(7);
      expect(weekDays[0].date).toBe('2024-01-01');
      expect(weekDays[6].date).toBe('2024-01-07');
    });

    it('should include workout data when provided', () => {
      const startDate = new Date(2024, 0, 1);
      const workouts = {
        '2024-01-01': {
          id: 1,
          title: 'Test Workout',
          is_completed: false,
          exercise_count: 3,
        },
      };
      
      const weekDays = getWeekDays(startDate, workouts);
      expect(weekDays[0].workout).toEqual(workouts['2024-01-01']);
    });
  });

  describe('getCalendarMonth', () => {
    it('should return calendar data for a month', () => {
      const calendar = getCalendarMonth(2024, 0); // January 2024
      
      expect(calendar.year).toBe(2024);
      expect(calendar.month).toBe(0);
      expect(calendar.monthName).toBe('January');
      expect(calendar.weeks.length).toBeGreaterThanOrEqual(4); // At least 4 weeks
      expect(calendar.weeks.length).toBeLessThanOrEqual(6); // At most 6 weeks
    });

    it('should include days from previous and next month', () => {
      const calendar = getCalendarMonth(2024, 1); // February 2024 (starts on Thursday)
      const firstWeek = calendar.weeks[0];
      
      // First week should include some January days
      expect(firstWeek.days.some(day => !day.isCurrentMonth)).toBe(true);
    });
  });

  describe('getPreviousWeek', () => {
    it('should return the previous week start date', () => {
      const currentDate = new Date(2024, 0, 8); // Monday, Jan 8, 2024
      const previousWeek = getPreviousWeek(currentDate);
      expect(formatDateString(previousWeek)).toBe('2024-01-01');
    });
  });

  describe('getNextWeek', () => {
    it('should return the next week start date', () => {
      const currentDate = new Date(2024, 0, 1); // Monday, Jan 1, 2024
      const nextWeek = getNextWeek(currentDate);
      expect(formatDateString(nextWeek)).toBe('2024-01-08');
    });
  });

  describe('getPreviousMonth', () => {
    it('should return previous month', () => {
      const result = getPreviousMonth(2024, 1); // February
      expect(result).toEqual({ year: 2024, month: 0 }); // January
    });

    it('should handle year rollover', () => {
      const result = getPreviousMonth(2024, 0); // January
      expect(result).toEqual({ year: 2023, month: 11 }); // December 2023
    });
  });

  describe('getNextMonth', () => {
    it('should return next month', () => {
      const result = getNextMonth(2024, 0); // January
      expect(result).toEqual({ year: 2024, month: 1 }); // February
    });

    it('should handle year rollover', () => {
      const result = getNextMonth(2024, 11); // December
      expect(result).toEqual({ year: 2025, month: 0 }); // January 2025
    });
  });

  describe('getDayNames', () => {
    it('should return full day names by default', () => {
      const dayNames = getDayNames();
      expect(dayNames).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    });

    it('should return short day names when requested', () => {
      const dayNames = getDayNames(true);
      expect(dayNames).toEqual([
        'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
      ]);
    });
  });

  describe('getWorkoutStatus', () => {
    it('should return "completed" for completed workouts', () => {
      const day = {
        date: '2024-01-01',
        dayOfWeek: 1,
        isToday: false,
        isCurrentMonth: true,
        workout: {
          id: 1,
          title: 'Test',
          is_completed: true,
          exercise_count: 3,
        },
      };
      
      expect(getWorkoutStatus(day)).toBe('completed');
    });

    it('should return "scheduled" for incomplete workouts', () => {
      const day = {
        date: '2024-01-01',
        dayOfWeek: 1,
        isToday: false,
        isCurrentMonth: true,
        workout: {
          id: 1,
          title: 'Test',
          is_completed: false,
          exercise_count: 3,
        },
      };
      
      expect(getWorkoutStatus(day)).toBe('scheduled');
    });

    it('should return "rest" for workouts with no exercises', () => {
      const day = {
        date: '2024-01-01',
        dayOfWeek: 1,
        isToday: false,
        isCurrentMonth: true,
        workout: {
          id: 1,
          title: 'Rest Day',
          is_completed: false,
          exercise_count: 0,
        },
      };
      
      expect(getWorkoutStatus(day)).toBe('rest');
    });

    it('should return "none" for days without workouts', () => {
      const day = {
        date: '2024-01-01',
        dayOfWeek: 1,
        isToday: false,
        isCurrentMonth: true,
      };
      
      expect(getWorkoutStatus(day)).toBe('none');
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date in short format by default', () => {
      const date = new Date(2024, 0, 3); // Jan 3, 2024
      const formatted = formatDisplayDate(date);
      expect(formatted).toMatch(/Jan 3/);
    });

    it('should format date in long format when requested', () => {
      const date = new Date(2024, 0, 3); // Jan 3, 2024
      const formatted = formatDisplayDate(date, 'long');
      expect(formatted).toMatch(/Wednesday, January 3, 2024/);
    });

    it('should format date in day format when requested', () => {
      const date = new Date(2024, 0, 3); // Jan 3, 2024
      const formatted = formatDisplayDate(date, 'day');
      expect(formatted).toMatch(/3 Wed/);
    });
  });

  describe('getWeekRangeString', () => {
    it('should return week range for same month', () => {
      const startDate = new Date(2024, 0, 1); // Monday, Jan 1, 2024
      const rangeString = getWeekRangeString(startDate);
      expect(rangeString).toMatch(/1 Mon - 7/);
    });

    it('should return week range spanning different months', () => {
      const startDate = new Date(2024, 0, 29); // Monday, Jan 29, 2024
      const rangeString = getWeekRangeString(startDate);
      expect(rangeString).toMatch(/29 Mon - 4 Sun/);
    });
  });
});