import React from 'react';
import { 
  getWeekDays, 
  getDayNames, 
  getWeekRangeString, 
  getWorkoutStatus,
  formatDateString 
} from '../../utils/calendarUtils';
import { useWorkoutsForDateRange } from '../../hooks/useCalendarData';
import type { CalendarNavigation, WorkoutSummary } from '../../types';
import styles from './WeeklyCalendar.module.css';

interface WeeklyCalendarProps {
  navigation: CalendarNavigation;
  onDayClick?: (date: string, workout?: WorkoutSummary) => void;
  onViewModeChange?: (mode: 'week' | 'month') => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  navigation,
  onDayClick,
  onViewModeChange,
}) => {
  const { currentDate, viewMode, goToToday, goToPrevious, goToNext } = navigation;
  
  // Calculate date range for the current week
  const weekStart = React.useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(start.setDate(diff));
  }, [currentDate]);

  const weekEnd = React.useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return end;
  }, [weekStart]);

  const startDateString = formatDateString(weekStart);
  const endDateString = formatDateString(weekEnd);

  // Fetch workouts for the week
  const { data: workouts = {}, isLoading, error } = useWorkoutsForDateRange(
    startDateString,
    endDateString
  );

  // Generate week days
  const weekDays = React.useMemo(() => {
    return getWeekDays(weekStart, workouts);
  }, [weekStart, workouts]);

  const dayNames = getDayNames(true);
  const weekRangeString = getWeekRangeString(weekStart);

  const handleDayClick = (date: string, workout?: WorkoutSummary) => {
    onDayClick?.(date, workout);
  };

  const handleViewModeChange = (mode: 'week' | 'month') => {
    navigation.setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const renderWorkoutIndicator = (workout: WorkoutSummary) => {
    const status = workout.is_completed ? 'completed' : 'scheduled';
    
    return (
      <div className={`${styles.workoutIndicator} ${styles[status]}`}>
        <div className={`${styles.statusDot} ${styles[status]}`} />
        <div className={styles.workoutTitle}>{workout.title}</div>
        {workout.duration_minutes && (
          <div className={styles.workoutMeta}>
            {workout.duration_minutes}min
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.weeklyCalendar}>
        <div style={{ color: 'var(--color-error)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          Error loading calendar data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.weeklyCalendar}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Previous week"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          <div className={styles.dateRange}>
            {weekRangeString}
          </div>
          
          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Next week"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <button
            className={styles.todayButton}
            onClick={goToToday}
          >
            Today
          </button>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'week' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('week')}
            >
              Week
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'month' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div className={styles.weekGrid}>
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <div key={dayName} className={styles.dayHeader}>
            {dayName}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={`${styles.dayCell} ${day.isToday ? styles.today : ''}`}
            onClick={() => handleDayClick(day.date, day.workout)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDayClick(day.date, day.workout);
              }
            }}
            aria-label={`${day.date}${day.workout ? ` - ${day.workout.title}` : ''}`}
          >
            <div className={styles.dayNumber}>
              {new Date(day.date).getDate()}
            </div>
            
            {isLoading ? (
              <div className={styles.emptyDay}>Loading...</div>
            ) : day.workout ? (
              renderWorkoutIndicator(day.workout)
            ) : (
              <div className={styles.emptyDay}>Rest day</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;