import React from 'react';
import { 
  getCalendarMonth, 
  getDayNames, 
  getWorkoutStatus,
  formatDateString 
} from '../../utils/calendarUtils';
import { useWorkoutsForDateRange, useWorkoutStats } from '../../hooks/useCalendarData';
import type { CalendarNavigation, WorkoutSummary } from '../../types';
import styles from './MonthlyCalendar.module.css';

interface MonthlyCalendarProps {
  navigation: CalendarNavigation;
  onDayClick?: (date: string, workout?: WorkoutSummary) => void;
  onViewModeChange?: (mode: 'week' | 'month') => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  navigation,
  onDayClick,
  onViewModeChange,
}) => {
  const { currentDate, viewMode, goToToday, goToPrevious, goToNext } = navigation;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate date range for the entire calendar view (including previous/next month days)
  const calendarData = React.useMemo(() => {
    return getCalendarMonth(year, month, {});
  }, [year, month]);

  const startDate = calendarData.weeks[0]?.startDate;
  const endDate = calendarData.weeks[calendarData.weeks.length - 1]?.endDate;

  // Fetch workouts for the entire calendar view
  const { data: workouts = {}, isLoading, error } = useWorkoutsForDateRange(
    startDate,
    endDate
  );

  // Get month stats
  const monthStart = formatDateString(new Date(year, month, 1));
  const monthEnd = formatDateString(new Date(year, month + 1, 0));
  const { data: stats } = useWorkoutStats(monthStart, monthEnd);

  // Update calendar data with workouts
  const calendarWithWorkouts = React.useMemo(() => {
    return getCalendarMonth(year, month, workouts);
  }, [year, month, workouts]);

  const dayNames = getDayNames(true);

  const handleDayClick = (date: string, workout?: WorkoutSummary) => {
    onDayClick?.(date, workout);
  };

  const handleViewModeChange = (mode: 'week' | 'month') => {
    navigation.setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const renderWorkoutDots = (workout: WorkoutSummary) => {
    const status = getWorkoutStatus({ 
      date: '', 
      dayOfWeek: 0, 
      isToday: false, 
      isCurrentMonth: true, 
      workout 
    });
    
    return (
      <div className={styles.workoutDots}>
        <div className={`${styles.workoutDot} ${styles[status]}`} />
      </div>
    );
  };

  const renderWorkoutPreview = (workout: WorkoutSummary) => {
    return (
      <div className={styles.workoutPreview}>
        <div className={styles.workoutTitle}>{workout.title}</div>
        <div className={styles.workoutMeta}>
          {workout.is_completed ? 'Completed' : 'Scheduled'}
          {workout.duration_minutes && ` • ${workout.duration_minutes}min`}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.monthlyCalendar}>
        <div style={{ color: 'var(--color-error)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          Error loading calendar data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.monthlyCalendar}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          <div className={styles.monthYear}>
            {calendarWithWorkouts.monthName} {calendarWithWorkouts.year}
          </div>
          
          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Next month"
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

      <div className={styles.monthGrid}>
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <div key={dayName} className={styles.dayHeader}>
            {dayName}
          </div>
        ))}

        {/* Calendar weeks */}
        {calendarWithWorkouts.weeks.map((week) => (
          <React.Fragment key={week.weekNumber}>
            {week.days.map((day) => (
              <div
                key={day.date}
                className={`
                  ${styles.dayCell} 
                  ${day.isToday ? styles.today : ''} 
                  ${!day.isCurrentMonth ? styles.otherMonth : ''}
                `}
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
                
                {isLoading ? null : day.workout ? (
                  <>
                    {renderWorkoutDots(day.workout)}
                    {renderWorkoutPreview(day.workout)}
                  </>
                ) : null}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Month statistics */}
      {stats && (
        <div className={styles.monthStats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.totalWorkouts}</div>
            <div className={styles.statLabel}>Total Workouts</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.completedWorkouts}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{Math.round(stats.completionRate)}%</div>
            <div className={styles.statLabel}>Completion Rate</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{Math.round(stats.averageDuration)}min</div>
            <div className={styles.statLabel}>Avg Duration</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;