// Planning feature types

export interface CalendarDay {
  date: string; // YYYY-MM-DD format
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isToday: boolean;
  isCurrentMonth: boolean;
  workout?: WorkoutSummary;
}

export interface WorkoutSummary {
  id: number;
  title: string;
  is_completed: boolean;
  exercise_count: number;
  duration_minutes?: number;
  completion_rate?: number; // 0-100
}

export interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
  startDate: string;
  endDate: string;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (JavaScript Date month)
  monthName: string;
  weeks: CalendarWeek[];
  totalDays: number;
}

export interface WorkoutScheduleItem {
  date: string;
  workout_id?: number;
  title: string;
  is_rest_day: boolean;
  is_completed: boolean;
  can_reschedule: boolean;
}

export interface CalendarViewMode {
  type: 'week' | 'month';
  currentDate: string; // YYYY-MM-DD
}

export interface WorkoutPreviewData {
  id: number;
  title: string;
  date: string;
  is_completed: boolean;
  duration_minutes?: number;
  exercises: {
    id: number;
    name_en: string;
    name_es: string;
    target_sets: number;
    target_reps: number;
    completed_sets?: number;
  }[];
  notes?: string;
}

export interface RescheduleWorkoutData {
  workout_id: number;
  from_date: string;
  to_date: string;
  reason?: string;
}

// Calendar navigation
export interface CalendarNavigation {
  currentDate: Date;
  viewMode: 'week' | 'month';
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;
  setViewMode: (mode: 'week' | 'month') => void;
}

// Workout status indicators
export type WorkoutStatus = 'scheduled' | 'completed' | 'rest' | 'missed' | 'rescheduled';

export interface WorkoutStatusIndicator {
  status: WorkoutStatus;
  color: string;
  label: string;
  icon?: string;
}