import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import styles from './WeeklyCalendar.module.css';

interface PlannedWorkout {
  id: string;
  date: string;
  workout_type: string;
  status: 'planned' | 'completed' | 'skipped';
}

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  workouts?: any;
  onWorkoutClick: (workout: PlannedWorkout) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onDateChange,
  workouts,
  onWorkoutClick
}) => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    onDateChange(newDate);
  };

  return (
    <Card className={styles.calendar}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={goToPreviousWeek}>
          ←
        </Button>
        <h3>
          Week of {startOfWeek.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </h3>
        <Button variant="ghost" onClick={goToNextWeek}>
          →
        </Button>
      </div>

      <div className={styles.weekGrid}>
        {weekDays.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return (
            <div key={index} className={`${styles.dayCard} ${isToday ? styles.today : ''}`}>
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{dayName}</span>
                <span className={styles.dayNumber}>{date.getDate()}</span>
              </div>
              
              <div className={styles.workoutSlot}>
                {/* Sample workout - replace with actual data */}
                {index % 2 === 0 && (
                  <div className={styles.workout}>
                    <span className={styles.workoutType}>Upper Body</span>
                    <span className={styles.workoutTime}>45 min</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};