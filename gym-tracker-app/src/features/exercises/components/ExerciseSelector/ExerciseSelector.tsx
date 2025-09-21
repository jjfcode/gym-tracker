import React, { useState, useMemo } from 'react';
import { Card, Button, Input } from '../../../../components/ui';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';
import { useCustomExercises } from '../../hooks/useCustomExercises';
import ExerciseCard from '../ExerciseCard';
import ExerciseFilters from '../ExerciseFilters';
import type { ExerciseSelectionProps, ExerciseSearchFilters } from '../../types';
import type { ExerciseLibraryItem } from '../../../../types/workout';
import type { CustomExercise } from '../../types';
import styles from './ExerciseSelector.module.css';

interface ExerciseSelectorProps extends ExerciseSelectionProps {
  onClose?: () => void;
  title?: string;
  locale?: 'en' | 'es';
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercises,
  onExerciseSelect,
  onExerciseDeselect,
  maxSelections,
  excludeExercises = [],
  onClose,
  title = 'Select Exercises',
  locale = 'en',
}) => {
  const [filters, setFilters] = useState<ExerciseSearchFilters>({
    searchQuery: '',
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    compoundOnly: false,
    customOnly: false,
  });

  const { filteredExercises, filterOptions, updateFilters, clearFilters } = useExerciseLibrary();
  const { customExercises } = useCustomExercises();

  // Combine library and custom exercises
  const allExercises = useMemo(() => {
    const libraryExercises = filteredExercises.filter(ex => !excludeExercises.includes(ex.slug));
    const customExs = customExercises.filter(ex => !excludeExercises.includes(ex.slug));
    
    if (filters.customOnly) {
      return customExs;
    }
    
    return [...libraryExercises, ...customExs];
  }, [filteredExercises, customExercises, excludeExercises, filters.customOnly]);

  // Apply additional filters to combined exercises
  const displayedExercises = useMemo(() => {
    let exercises = allExercises;

    // Apply search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(exercise => {
        const name = locale === 'en' ? exercise.name_en : exercise.name_es;
        return name.toLowerCase().includes(query) ||
               exercise.muscle_groups.some(group => group.includes(query)) ||
               exercise.equipment.includes(query);
      });
    }

    // Apply muscle group filter
    if (filters.muscleGroups.length > 0) {
      exercises = exercises.filter(exercise =>
        filters.muscleGroups.some(group => exercise.muscle_groups.includes(group))
      );
    }

    // Apply equipment filter
    if (filters.equipment.length > 0) {
      exercises = exercises.filter(exercise =>
        filters.equipment.includes(exercise.equipment)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      exercises = exercises.filter(exercise =>
        filters.difficulty.includes(exercise.difficulty_level)
      );
    }

    // Apply compound filter
    if (filters.compoundOnly) {
      exercises = exercises.filter(exercise => exercise.is_compound);
    }

    return exercises;
  }, [allExercises, filters, locale]);

  const handleFilterChange = (newFilters: Partial<ExerciseSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Also update the exercise library filters for library exercises
    updateFilters({
      searchQuery: newFilters.searchQuery,
      muscleGroups: newFilters.muscleGroups,
      equipment: newFilters.equipment,
      difficulty: newFilters.difficulty,
      compoundOnly: newFilters.compoundOnly,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      muscleGroups: [],
      equipment: [],
      difficulty: [],
      compoundOnly: false,
      customOnly: false,
    });
    clearFilters();
  };

  const handleExerciseToggle = (exercise: ExerciseLibraryItem | CustomExercise) => {
    const isSelected = selectedExercises.includes(exercise.slug);
    
    if (isSelected) {
      onExerciseDeselect(exercise.slug);
    } else {
      if (maxSelections && selectedExercises.length >= maxSelections) {
        return; // Don't allow more selections
      }
      onExerciseSelect(exercise.slug);
    }
  };

  const canSelectMore = !maxSelections || selectedExercises.length < maxSelections;

  return (
    <div className={styles.exerciseSelector}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {maxSelections && (
          <div className={styles.selectionCount}>
            {selectedExercises.length} / {maxSelections} selected
          </div>
        )}
        {onClose && (
          <Button variant="ghost" onClick={onClose} className={styles.closeButton}>
            ×
          </Button>
        )}
      </div>

      <ExerciseFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterOptions={filterOptions}
        resultCount={displayedExercises.length}
        totalCount={allExercises.length}
      />

      {displayedExercises.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>No exercises found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <Button variant="ghost" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className={styles.exerciseGrid}>
          {displayedExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.slug);
            const canSelect = canSelectMore || isSelected;
            
            return (
              <ExerciseCard
                key={exercise.slug}
                exercise={exercise}
                locale={locale}
                isSelected={isSelected}
                onSelect={canSelect ? () => handleExerciseToggle(exercise) : undefined}
                showActions={true}
                compact={true}
              />
            );
          })}
        </div>
      )}

      {selectedExercises.length > 0 && (
        <div className={styles.selectedSummary}>
          <Card className={styles.summaryCard}>
            <h3>Selected Exercises ({selectedExercises.length})</h3>
            <div className={styles.selectedList}>
              {selectedExercises.map((slug) => {
                const exercise = allExercises.find(ex => ex.slug === slug);
                if (!exercise) return null;
                
                const name = locale === 'en' ? exercise.name_en : exercise.name_es;
                return (
                  <div key={slug} className={styles.selectedItem}>
                    <span>{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExerciseDeselect(slug)}
                      className={styles.removeButton}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;