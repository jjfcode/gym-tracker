import React from 'react';
import { Card, Button } from '../../../../components/ui';
import type { ExerciseLibraryItem } from '../../../../types/workout';
import type { CustomExercise } from '../../types';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: ExerciseLibraryItem | CustomExercise;
  locale?: 'en' | 'es';
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  locale = 'en',
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  isSelected = false,
  showActions = true,
  compact = false,
}) => {
  const name = locale === 'en' ? exercise.name_en : exercise.name_es;
  const instructions = locale === 'en' ? exercise.instructions_en : exercise.instructions_es;
  const isCustom = 'is_custom' in exercise && exercise.is_custom;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--color-success)';
      case 'intermediate': return 'var(--color-warning)';
      case 'advanced': return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  const formatMuscleGroups = (groups: string[]) => {
    return groups.map(group => 
      group.charAt(0).toUpperCase() + group.slice(1).replace('-', ' ')
    ).join(', ');
  };

  const formatEquipment = (equipment: string) => {
    return equipment.charAt(0).toUpperCase() + equipment.slice(1).replace('-', ' ');
  };

  return (
    <Card 
      className={`${styles.exerciseCard} ${isSelected ? styles.selected : ''} ${compact ? styles.compact : ''}`}
      variant="outlined"
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.name}>{name}</h3>
          {isCustom && (
            <span className={styles.customBadge}>Custom</span>
          )}
        </div>
        
        <div className={styles.metadata}>
          <span 
            className={styles.difficulty}
            style={{ color: getDifficultyColor(exercise.difficulty_level) }}
          >
            {exercise.difficulty_level}
          </span>
          {exercise.is_compound && (
            <span className={styles.compoundBadge}>Compound</span>
          )}
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.muscleGroups}>
          <strong>Muscle Groups:</strong> {formatMuscleGroups(exercise.muscle_groups)}
        </div>
        
        <div className={styles.equipment}>
          <strong>Equipment:</strong> {formatEquipment(exercise.equipment)}
        </div>

        {!compact && instructions && (
          <div className={styles.instructions}>
            <strong>Instructions:</strong>
            <p>{instructions}</p>
          </div>
        )}

        {exercise.media_url && (
          <div className={styles.media}>
            <img 
              src={exercise.media_url} 
              alt={name}
              className={styles.exerciseImage}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {showActions && (
        <div className={styles.actions}>
          {onSelect && (
            <Button
              variant={isSelected ? "secondary" : "primary"}
              size="sm"
              onClick={onSelect}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
          
          {isCustom && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          
          {isCustom && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className={styles.deleteButton}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default ExerciseCard;