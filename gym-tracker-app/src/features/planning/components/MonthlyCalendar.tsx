import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import styles from './MonthlyCalendar.module.css';

interface PlannedWorkout {
  id: string;
  date: string;
  workout_type: string;
  status: 'planned' | 'completed' | 'skipped';
}

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  workouts?: any;
  onWorkoutClick: (workout: PlannedWorkout) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  selectedDate,
  onDateChange,
  workouts,
  onWorkoutClick
}) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    onDateChange(newDate);
  };

  return (
    <Card className={styles.calendar}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={goToPreviousMonth}>
          ←
        </Button>
        <h3>
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric'
          })}
        </h3>
        <Button variant="ghost" onClick={goToNextMonth}>
          →
        </Button>
      </div>

      <div className={styles.weekdayHeaders}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekdayHeader}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index} 
              className={`
                ${styles.dayCell} 
                ${!isCurrentMonth ? styles.otherMonth : ''} 
                ${isToday ? styles.today : ''}
              `}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>
              
              {/* Sample workout indicators */}
              {isCurrentMonth && (date.getDate() % 3 === 0) && (
                <div className={styles.workoutIndicator} />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};