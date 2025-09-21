import React from 'react';
import { Card, Button, Modal } from '../../../../components/ui';
import type { ExerciseLibraryItem } from '../../../../types/workout';
import type { CustomExercise } from '../../types';
import styles from './ExerciseDetail.module.css';

interface ExerciseDetailProps {
  exercise: ExerciseLibraryItem | CustomExercise | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  locale?: 'en' | 'es';
  isSelected?: boolean;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSelect,
  locale = 'en',
  isSelected = false,
}) => {
  if (!exercise) return null;

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
    );
  };

  const formatEquipment = (equipment: string) => {
    return equipment.charAt(0).toUpperCase() + equipment.slice(1).replace('-', ' ');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className={styles.exerciseDetail}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.name}>{name}</h1>
            <div className={styles.badges}>
              {isCustom && (
                <span className={styles.customBadge}>Custom</span>
              )}
              <span 
                className={styles.difficultyBadge}
                style={{ 
                  backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20',
                  color: getDifficultyColor(exercise.difficulty_level)
                }}
              >
                {exercise.difficulty_level}
              </span>
              {exercise.is_compound && (
                <span className={styles.compoundBadge}>Compound</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {exercise.media_url && (
            <div className={styles.mediaSection}>
              <img 
                src={exercise.media_url} 
                alt={name}
                className={styles.exerciseImage}
              />
            </div>
          )}

          <div className={styles.detailsGrid}>
            <Card className={styles.infoCard} variant="outlined">
              <h3 className={styles.sectionTitle}>Exercise Information</h3>
              
              <div className={styles.infoItem}>
                <strong>Muscle Groups:</strong>
                <div className={styles.muscleGroupTags}>
                  {formatMuscleGroups(exercise.muscle_groups).map((group, index) => (
                    <span key={index} className={styles.muscleGroupTag}>
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.infoItem}>
                <strong>Equipment:</strong>
                <span className={styles.equipmentTag}>
                  {formatEquipment(exercise.equipment)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <strong>Exercise Type:</strong>
                <span>{exercise.is_compound ? 'Compound' : 'Isolation'}</span>
              </div>

              {exercise.variations && exercise.variations.length > 0 && (
                <div className={styles.infoItem}>
                  <strong>Variations:</strong>
                  <ul className={styles.variationsList}>
                    {exercise.variations.map((variation, index) => (
                      <li key={index}>{variation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className={styles.instructionsCard} variant="outlined">
              <h3 className={styles.sectionTitle}>Instructions</h3>
              <div className={styles.instructions}>
                <p>{instructions}</p>
              </div>
            </Card>
          </div>
        </div>

        <div className={styles.actions}>
          {onSelect && (
            <Button
              variant={isSelected ? "secondary" : "primary"}
              onClick={onSelect}
            >
              {isSelected ? 'Selected' : 'Select Exercise'}
            </Button>
          )}
          
          {isCustom && onEdit && (
            <Button
              variant="ghost"
              onClick={onEdit}
            >
              Edit Exercise
            </Button>
          )}
          
          {isCustom && onDelete && (
            <Button
              variant="ghost"
              onClick={onDelete}
              className={styles.deleteButton}
            >
              Delete Exercise
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExerciseDetail;