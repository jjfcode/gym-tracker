import React, { useState } from 'react';
import { Button, Modal } from '../../../../components/ui';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';
import ExerciseCard from '../ExerciseCard';
import ExerciseFilters from '../ExerciseFilters';
import ExerciseDetail from '../ExerciseDetail';
import ExerciseSelector from '../ExerciseSelector';
import CustomExerciseForm from '../CustomExerciseForm';
import type { ExerciseLibraryItem } from '../../../../types/workout';
import type { ExerciseSearchFilters } from '../../types';
import type { CustomExerciseFormData } from '../../../../lib/validations/exercise';
import styles from './ExerciseLibraryDemo.module.css';

const ExerciseLibraryDemo: React.FC = () => {
  const [filters, setFilters] = useState<ExerciseSearchFilters>({
    searchQuery: '',
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    compoundOnly: false,
    customOnly: false,
  });

  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibraryItem | null>(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const { filteredExercises, filterOptions, updateFilters, clearFilters } = useExerciseLibrary();

  const handleFilterChange = (newFilters: Partial<ExerciseSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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

  const handleViewDetails = (exercise: ExerciseLibraryItem) => {
    setSelectedExercise(exercise);
    setShowExerciseDetail(true);
  };

  const handleCreateExercise = (data: CustomExerciseFormData) => {
    console.log('Creating custom exercise:', data);
    alert('Custom exercise created! (Demo mode - not saved to database)');
    setShowCreateForm(false);
  };

  const handleExerciseSelect = (slug: string) => {
    setSelectedExercises(prev => [...prev, slug]);
  };

  const handleExerciseDeselect = (slug: string) => {
    setSelectedExercises(prev => prev.filter(s => s !== slug));
  };

  return (
    <div className={styles.demo}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Exercise Library Demo</h1>
          <p className={styles.subtitle}>
            Explore the exercise library features (Demo mode - custom exercises won't be saved)
          </p>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => setShowSelector(true)}
          >
            Exercise Selector
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Custom Exercise
          </Button>
        </div>
      </div>

      <ExerciseFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterOptions={filterOptions}
        resultCount={filteredExercises.length}
        totalCount={filteredExercises.length}
      />

      <div className={styles.exerciseGrid}>
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.slug}
            exercise={exercise}
            onViewDetails={() => handleViewDetails(exercise)}
            showActions={true}
          />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No exercises found</h3>
          <p>Try adjusting your filters or create a custom exercise.</p>
          <Button variant="primary" onClick={() => setShowCreateForm(true)}>
            Create Custom Exercise
          </Button>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetail
        exercise={selectedExercise}
        isOpen={showExerciseDetail}
        onClose={() => {
          setShowExerciseDetail(false);
          setSelectedExercise(null);
        }}
      />

      {/* Create Exercise Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        size="lg"
      >
        <CustomExerciseForm
          onSubmit={handleCreateExercise}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      {/* Exercise Selector Modal */}
      <Modal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        size="xl"
      >
        <ExerciseSelector
          selectedExercises={selectedExercises}
          onExerciseSelect={handleExerciseSelect}
          onExerciseDeselect={handleExerciseDeselect}
          maxSelections={5}
          title="Select Exercises for Workout"
          onClose={() => setShowSelector(false)}
        />
      </Modal>
    </div>
  );
};

export default ExerciseLibraryDemo;