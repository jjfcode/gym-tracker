import type { CalendarDay, CalendarWeek, CalendarMonth, WorkoutSummary } from '../types';

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust when day is Sunday
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  return result;
};

/**
 * Get the end of the week (Sunday) for a given date
 */
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse YYYY-MM-DD string to Date
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateString(date1) === formatDateString(date2);
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get days in a week starting from a given date
 */
export const getWeekDays = (
  startDate: Date,
  workouts: Record<string, WorkoutSummary> = {}
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateString = formatDateString(date);
    
    days.push({
      date: dateString,
      dayOfWeek: date.getDay(),
      isToday: isSameDay(date, today),
      isCurrentMonth: true, // For week view, all days are considered current
      workout: workouts[dateString],
    });
  }
  
  return days;
};

/**
 * Get calendar month data with weeks
 */
export const getCalendarMonth = (
  year: number,
  month: number,
  workouts: Record<string, WorkoutSummary> = {}
): CalendarMonth => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  
  // Get the Monday of the week containing the first day of the month
  const calendarStart = getWeekStart(firstDay);
  
  // Get the Sunday of the week containing the last day of the month
  const calendarEnd = getWeekEnd(lastDay);
  
  const weeks: CalendarWeek[] = [];
  let weekNumber = 1;
  
  const current = new Date(calendarStart);
  
  while (current <= calendarEnd) {
    const weekStart = new Date(current);
    const weekDays: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      const dateString = formatDateString(date);
      
      weekDays.push({
        date: dateString,
        dayOfWeek: date.getDay(),
        isToday: isSameDay(date, today),
        isCurrentMonth: date.getMonth() === month,
        workout: workouts[dateString],
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() - 1);
    
    weeks.push({
      weekNumber,
      days: weekDays,
      startDate: formatDateString(weekStart),
      endDate: formatDateString(weekEnd),
    });
    
    weekNumber++;
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    year,
    month,
    monthName: monthNames[month],
    weeks,
    totalDays: lastDay.getDate(),
  };
};

/**
 * Get the previous week's start date
 */
export const getPreviousWeek = (currentDate: Date): Date => {
  const weekStart = getWeekStart(currentDate);
  weekStart.setDate(weekStart.getDate() - 7);
  return weekStart;
};

/**
 * Get the next week's start date
 */
export const getNextWeek = (currentDate: Date): Date => {
  const weekStart = getWeekStart(currentDate);
  weekStart.setDate(weekStart.getDate() + 7);
  return weekStart;
};

/**
 * Get the previous month
 */
export const getPreviousMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

/**
 * Get the next month
 */
export const getNextMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
};

/**
 * Get day names for calendar headers
 */
export const getDayNames = (short: boolean = false): string[] => {
  const long = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const short_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return short ? short_names : long;
};

/**
 * Get workout status based on workout data
 */
export const getWorkoutStatus = (day: CalendarDay): 'scheduled' | 'completed' | 'rest' | 'none' => {
  if (!day.workout) {
    return 'none';
  }
  
  if (day.workout.is_completed) {
    return 'completed';
  }
  
  // Check if it's a rest day (workout with no exercises or specific rest day marker)
  if (day.workout.exercise_count === 0) {
    return 'rest';
  }
  
  return 'scheduled';
};

/**
 * Calculate completion percentage for a workout
 */
export const calculateCompletionRate = (workout: WorkoutSummary): number => {
  if (workout.completion_rate !== undefined) {
    return workout.completion_rate;
  }
  
  // If no completion rate provided, assume 100% if completed, 0% if not
  return workout.is_completed ? 100 : 0;
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date, format: 'short' | 'long' | 'day' = 'short'): string => {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'long':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'day':
      options.weekday = 'short';
      options.day = 'numeric';
      break;
    default:
      options.month = 'short';
      options.day = 'numeric';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get week range string for display
 */
export const getWeekRangeString = (startDate: Date): string => {
  const endDate = getWeekEnd(startDate);
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${formatDisplayDate(startDate, 'day')} - ${endDate.getDate()}`;
  } else {
    return `${formatDisplayDate(startDate, 'day')} - ${formatDisplayDate(endDate, 'day')}`;
  }
};