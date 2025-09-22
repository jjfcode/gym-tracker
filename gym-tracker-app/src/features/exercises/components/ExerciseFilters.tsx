import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import type { ExerciseFilters as FilterType } from '../../../types/exercise';
import styles from './ExerciseFilters.module.css';

interface ExerciseFiltersProps {
  filters: FilterType;
  categories?: string[];
  muscleGroups?: string[];
  onFilterChange: (filters: Partial<FilterType>) => void;
}

export const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  filters,
  categories = [],
  muscleGroups = [],
  onFilterChange
}) => {
  const equipmentOptions = [
    'Barbell',
    'Dumbbell',
    'Machine',
    'Cable',
    'Bodyweight',
    'Resistance Band',
    'Kettlebell'
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const clearFilters = () => {
    onFilterChange({
      category: undefined,
      muscleGroup: undefined,
      equipment: undefined,
      difficulty: undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <Card className={styles.filtersCard}>
      <div className={styles.filtersHeader}>
        <h4>Filters</h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        {/* Category Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Muscle Group Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Muscle Group</label>
          <select
            value={filters.muscleGroup || ''}
            onChange={(e) => onFilterChange({ muscleGroup: e.target.value || undefined })}
            className={styles.filterSelect}
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups.map(muscle => (
              <option key={muscle} value={muscle}>
                {muscle}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Equipment</label>
          <select
            value={filters.equipment || ''}
            onChange={(e) => onFilterChange({ equipment: e.target.value || undefined })}
            className={styles.filterSelect}
          >
            <option value="">All Equipment</option>
            {equipmentOptions.map(equipment => (
              <option key={equipment} value={equipment}>
                {equipment}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Difficulty</label>
          <div className={styles.difficultyButtons}>
            {difficultyOptions.map(option => (
              <Button
                key={option.value}
                variant={filters.difficulty === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ 
                  difficulty: filters.difficulty === option.value ? undefined : option.value as any
                })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          <span className={styles.activeFiltersLabel}>Active filters:</span>
          <div className={styles.activeFilterTags}>
            {filters.category && (
              <span className={styles.filterTag}>
                Category: {filters.category}
                <button 
                  onClick={() => onFilterChange({ category: undefined })}
                  className={styles.removeFilter}
                >
                  ×
                </button>
              </span>
            )}
            {filters.muscleGroup && (
              <span className={styles.filterTag}>
                Muscle: {filters.muscleGroup}
                <button 
                  onClick={() => onFilterChange({ muscleGroup: undefined })}
                  className={styles.removeFilter}
                >
                  ×
                </button>
              </span>
            )}
            {filters.equipment && (
              <span className={styles.filterTag}>
                Equipment: {filters.equipment}
                <button 
                  onClick={() => onFilterChange({ equipment: undefined })}
                  className={styles.removeFilter}
                >
                  ×
                </button>
              </span>
            )}
            {filters.difficulty && (
              <span className={styles.filterTag}>
                Difficulty: {filters.difficulty}
                <button 
                  onClick={() => onFilterChange({ difficulty: undefined })}
                  className={styles.removeFilter}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};