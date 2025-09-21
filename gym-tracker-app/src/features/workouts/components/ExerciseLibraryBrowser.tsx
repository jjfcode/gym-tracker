import React from 'react';
import { useExerciseLibrary } from '../../../hooks/useExerciseLibrary';
import type { MuscleGroup, Equipment } from '../../../types/workout';

interface ExerciseLibraryBrowserProps {
  onExerciseSelected?: (exerciseSlug: string) => void;
  locale?: 'en' | 'es';
}

export function ExerciseLibraryBrowser({ 
  onExerciseSelected, 
  locale = 'en' 
}: ExerciseLibraryBrowserProps) {
  const {
    filteredExercises,
    filters,
    updateFilters,
    clearFilters,
    filterOptions,
    hasActiveFilters,
    exerciseCount,
    totalExerciseCount,
  } = useExerciseLibrary();

  const handleSearchChange = (searchQuery: string) => {
    updateFilters({ searchQuery });
  };

  const handleMuscleGroupFilter = (muscleGroup: MuscleGroup, checked: boolean) => {
    const newMuscleGroups = checked
      ? [...filters.muscleGroups, muscleGroup]
      : filters.muscleGroups.filter(mg => mg !== muscleGroup);
    
    updateFilters({ muscleGroups: newMuscleGroups });
  };

  const handleEquipmentFilter = (equipment: Equipment, checked: boolean) => {
    const newEquipment = checked
      ? [...filters.equipment, equipment]
      : filters.equipment.filter(eq => eq !== equipment);
    
    updateFilters({ equipment: newEquipment });
  };

  const handleDifficultyFilter = (difficulty: 'beginner' | 'intermediate' | 'advanced', checked: boolean) => {
    const newDifficulty = checked
      ? [...filters.difficulty, difficulty]
      : filters.difficulty.filter(d => d !== difficulty);
    
    updateFilters({ difficulty: newDifficulty });
  };

  return (
    <div className="exercise-library-browser">
      <div className="library-header">
        <h2>Exercise Library</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search exercises..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="results-info">
          Showing {exerciseCount} of {totalExerciseCount} exercises
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="library-content">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Muscle Groups</h3>
            {filterOptions.muscleGroups.map(muscleGroup => (
              <label key={muscleGroup} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.muscleGroups.includes(muscleGroup)}
                  onChange={(e) => handleMuscleGroupFilter(muscleGroup, e.target.checked)}
                />
                {muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3>Equipment</h3>
            {filterOptions.equipment.map(equipment => (
              <label key={equipment} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.equipment.includes(equipment)}
                  onChange={(e) => handleEquipmentFilter(equipment, e.target.checked)}
                />
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3>Difficulty</h3>
            {filterOptions.difficulties.map(difficulty => (
              <label key={difficulty} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(difficulty)}
                  onChange={(e) => handleDifficultyFilter(difficulty, e.target.checked)}
                />
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.compoundOnly}
                onChange={(e) => updateFilters({ compoundOnly: e.target.checked })}
              />
              Compound exercises only
            </label>
          </div>
        </div>

        <div className="exercises-grid">
          {filteredExercises.map(exercise => (
            <div key={exercise.slug} className="exercise-card">
              <div className="exercise-header">
                <h4>{locale === 'en' ? exercise.name_en : exercise.name_es}</h4>
                <div className="exercise-badges">
                  <span className={`difficulty-badge ${exercise.difficulty_level}`}>
                    {exercise.difficulty_level}
                  </span>
                  {exercise.is_compound && (
                    <span className="compound-badge">Compound</span>
                  )}
                </div>
              </div>

              <div className="exercise-details">
                <div className="muscle-groups">
                  <strong>Targets:</strong> {exercise.muscle_groups.join(', ')}
                </div>
                <div className="equipment">
                  <strong>Equipment:</strong> {exercise.equipment}
                </div>
                <div className="instructions">
                  {locale === 'en' ? exercise.instructions_en : exercise.instructions_es}
                </div>
              </div>

              {onExerciseSelected && (
                <button 
                  onClick={() => onExerciseSelected(exercise.slug)}
                  className="select-exercise-btn"
                >
                  Add to Workout
                </button>
              )}
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="no-exercises">
              <p>No exercises match your current filters.</p>
              <button onClick={clearFilters}>Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}