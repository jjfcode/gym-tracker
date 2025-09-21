import React from 'react';
import { Button } from '../../../components/ui';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import styles from './WorkoutTimer.module.css';

interface WorkoutTimerProps {
  workoutId?: number;
  onComplete?: (elapsedTime: number) => void;
  className?: string;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  workoutId,
  onComplete,
  className,
}) => {
  const {
    isRunning,
    formattedTime,
    isActive,
    elapsedTime,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useWorkoutTimer(workoutId);

  const handleComplete = () => {
    stop();
    onComplete?.(elapsedTime);
  };

  return (
    <div className={`${styles.workoutTimer} ${className || ''}`}>
      <div className={styles.display}>
        <div className={styles.time}>{formattedTime}</div>
        <div className={styles.status}>
          {isRunning ? 'Running' : isActive ? 'Paused' : 'Stopped'}
        </div>
      </div>
      
      <div className={styles.controls}>
        {!isActive ? (
          <Button
            variant="primary"
            size="sm"
            onClick={start}
            className={styles.startButton}
          >
            Start Workout
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={pause}
                className={styles.pauseButton}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={resume}
                className={styles.resumeButton}
              >
                Resume
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className={styles.completeButton}
            >
              Complete
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className={styles.resetButton}
            >
              Reset
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;