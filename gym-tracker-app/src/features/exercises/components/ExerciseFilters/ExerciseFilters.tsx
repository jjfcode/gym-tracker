import React from 'react';
import { Card, Button, Select, Input } from '../../../../components/ui';
import type { ExerciseSearchFilters } from '../../types';
import type { MuscleGroup, Equipment } from '../../../../types/workout';
import styles from './ExerciseFilters.module.css';

interface ExerciseFiltersProps {
  filters: ExerciseSearchFilters;
  onFiltersChange: (filters: Partial<ExerciseSearchFilters>) => void;
  onClearFilters: () => void;
  filterOptions: {
    muscleGroups: MuscleGroup[];
    equipment: Equipment[];
    difficulties: ('beginner' | 'intermediate' | 'advanced')[];
  };
  resultCount: number;
  totalCount: number;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions,
  resultCount,
  totalCount,
}) => {
  const formatLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
  };

  const muscleGroupOptions = filterOptions.muscleGroups.map(mg => ({
    value: mg,
    label: formatLabel(mg),
  }));

  const equipmentOptions = filterOptions.equipment.map(eq => ({
    value: eq,
    label: formatLabel(eq),
  }));

  const difficultyOptions = filterOptions.difficulties.map(diff => ({
    value: diff,
    label: formatLabel(diff),
  }));

  const hasActiveFilters = 
    filters.searchQuery.trim() !== '' ||
    filters.muscleGroups.length > 0 ||
    filters.equipment.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.compoundOnly ||
    filters.customOnly;

  return (
    <Card className={styles.filtersCard} variant="outlined">
      <div className={styles.header}>
        <h3 className={styles.title}>Filter Exercises</h3>
        <div className={styles.resultCount}>
          {resultCount} of {totalCount} exercises
        </div>
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.searchSection}>
          <Input
            type="text"
            placeholder="Search exercises..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>Muscle Groups</label>
          <Select
            options={muscleGroupOptions}
            value={filters.muscleGroups}
            onChange={(value) => onFiltersChange({ muscleGroups: value as MuscleGroup[] })}
            placeholder="Select muscle groups"
            multiple
            searchable
          />
        </div>

        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>Equipment</label>
          <Select
            options={equipmentOptions}
            value={filters.equipment}
            onChange={(value) => onFiltersChange({ equipment: value as Equipment[] })}
            placeholder="Select equipment"
            multiple
            searchable
          />
        </div>

        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>Difficulty</label>
          <Select
            options={difficultyOptions}
            value={filters.difficulty}
            onChange={(value) => onFiltersChange({ difficulty: value as ('beginner' | 'intermediate' | 'advanced')[] })}
            placeholder="Select difficulty"
            multiple
          />
        </div>

        <div className={styles.checkboxSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.compoundOnly}
              onChange={(e) => onFiltersChange({ compoundOnly: e.target.checked })}
              className={styles.checkbox}
            />
            Compound exercises only
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.customOnly}
              onChange={(e) => onFiltersChange({ customOnly: e.target.checked })}
              className={styles.checkbox}
            />
            Custom exercises only
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ExerciseFilters;