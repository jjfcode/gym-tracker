import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import type { Exercise } from '../../../types/exercise';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  isSelected?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onSelect,
  isSelected = false
}) => {
  return (
    <Card 
      className={`${styles.exerciseCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(exercise)}
    >
      {exercise.image_url && (
        <div className={styles.imageContainer}>
          <img 
            src={exercise.image_url} 
            alt={exercise.name}
            className={styles.exerciseImage}
          />
        </div>
      )}
      
      <div className={styles.content}>
        <h4 className={styles.exerciseName}>{exercise.name}</h4>
        
        <div className={styles.category}>
          {exercise.category}
        </div>
        
        <div className={styles.muscles}>
          <div className={styles.primaryMuscles}>
            {exercise.primary_muscles.slice(0, 2).map(muscle => (
              <span key={muscle} className={styles.muscleTag}>
                {muscle}
              </span>
            ))}
            {exercise.primary_muscles.length > 2 && (
              <span className={styles.moreTag}>
                +{exercise.primary_muscles.length - 2}
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.metadata}>
          {exercise.equipment && (
            <span className={styles.equipment}>
              🏋️ {exercise.equipment}
            </span>
          )}
          {exercise.difficulty && (
            <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
              {exercise.difficulty}
            </span>
          )}
        </div>
        
        {exercise.description && (
          <p className={styles.description}>
            {exercise.description.length > 100 
              ? `${exercise.description.substring(0, 100)}...`
              : exercise.description
            }
          </p>
        )}
        
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(exercise);
            }}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Add to workout functionality
            }}
          >
            Add to Workout
          </Button>
        </div>
      </div>
    </Card>
  );
};