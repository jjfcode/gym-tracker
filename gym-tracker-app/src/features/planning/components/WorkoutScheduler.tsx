import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import styles from './WorkoutScheduler.module.css';

interface WorkoutSchedule {
  id: string;
  day_of_week: number;
  workout_type: string;
  is_active: boolean;
}

interface WorkoutSchedulerProps {
  schedule?: WorkoutSchedule[];
  onScheduleUpdate: (schedule: any) => void;
}

export const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = ({
  schedule = [],
  onScheduleUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localSchedule, setLocalSchedule] = useState(schedule);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const workoutTypes = [
    'Upper Body',
    'Lower Body',
    'Full Body',
    'Cardio',
    'Push',
    'Pull',
    'Legs',
    'Rest'
  ];

  const toggleWorkoutDay = (dayOfWeek: number, workoutType: string) => {
    const existingIndex = localSchedule.findIndex(s => s.day_of_week === dayOfWeek);
    
    if (existingIndex >= 0) {
      // Update existing or remove
      if (localSchedule[existingIndex].workout_type === workoutType) {
        // Remove
        setLocalSchedule(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        // Update
        setLocalSchedule(prev => prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, workout_type: workoutType }
            : item
        ));
      }
    } else {
      // Add new
      setLocalSchedule(prev => [...prev, {
        id: `temp-${Date.now()}`,
        day_of_week: dayOfWeek,
        workout_type: workoutType,
        is_active: true
      }]);
    }
  };

  const saveSchedule = () => {
    onScheduleUpdate(localSchedule);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setLocalSchedule(schedule);
    setEditMode(false);
  };

  return (
    <Card className={styles.scheduler}>
      <div className={styles.header}>
        <h3>Weekly Workout Schedule</h3>
        {!editMode ? (
          <Button variant="outline" onClick={() => setEditMode(true)}>
            Edit Schedule
          </Button>
        ) : (
          <div className={styles.editActions}>
            <Button variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveSchedule}>
              Save
            </Button>
          </div>
        )}
      </div>

      <div className={styles.scheduleGrid}>
        {daysOfWeek.map(day => {
          const daySchedule = localSchedule.find(s => s.day_of_week === day.value);
          
          return (
            <div key={day.value} className={styles.dayRow}>
              <div className={styles.dayLabel}>
                {day.label}
              </div>
              
              <div className={styles.workoutSelection}>
                {editMode ? (
                  <select
                    value={daySchedule?.workout_type || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleWorkoutDay(day.value, e.target.value);
                      }
                    }}
                    className={styles.workoutSelect}
                  >
                    <option value="">Rest Day</option>
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={styles.workoutDisplay}>
                    {daySchedule ? (
                      <span className={styles.workoutType}>
                        {daySchedule.workout_type}
                      </span>
                    ) : (
                      <span className={styles.restDay}>Rest Day</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!editMode && (
        <div className={styles.summary}>
          <p>
            <strong>Weekly Summary:</strong> {localSchedule.length} workout days, {7 - localSchedule.length} rest days
          </p>
        </div>
      )}
    </Card>
  );
};