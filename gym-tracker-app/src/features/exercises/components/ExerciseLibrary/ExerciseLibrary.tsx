import React, { useState, useMemo } from 'react';
import { Button, Modal } from '../../../../components/ui';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';
import { useCustomExercises } from '../../hooks/useCustomExercises';
import { useAppStore } from '../../../../store';
import ExerciseCard from '../ExerciseCard';
import ExerciseFilters from '../ExerciseFilters';
import ExerciseDetail from '../ExerciseDetail';
import CustomExerciseForm from '../CustomExerciseForm';
import type { ExerciseLibraryItem } from '../../../../types/workout';
import type { CustomExercise, ExerciseSearchFilters } from '../../types';
import type { CustomExerciseFormData } from '../../../../lib/validations/exercise';
import styles from './ExerciseLibrary.module.css';

const ExerciseLibrary: React.FC = () => {
  const { language } = useAppStore();
  const locale = language as 'en' | 'es';

  const [filters, setFilters] = useState<ExerciseSearchFilters>({
    searchQuery: '',
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    compoundOnly: false,
    customOnly: false,
  });

  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibraryItem | CustomExercise | null>(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(null);

  const { filteredExercises, filterOptions, updateFilters, clearFilters } = useExerciseLibrary();
  const { 
    customExercises, 
    createCustomExercise, 
    updateCustomExercise, 
    deleteCustomExercise,
    isCreating,
    isUpdating,
    isDeleting 
  } = useCustomExercises();

  // Combine library and custom exercises
  const allExercises = useMemo(() => {
    if (filters.customOnly) {
      return customExercises;
    }
    return [...filteredExercises, ...customExercises];
  }, [filteredExercises, customExercises, filters.customOnly]);

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

  const handleViewDetails = (exercise: ExerciseLibraryItem | CustomExercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetail(true);
  };

  const handleCreateExercise = (data: CustomExerciseFormData) => {
    createCustomExercise({
      user_id: '', // Will be set by the service
      is_custom: true,
      ...data,
    });
    setShowCreateForm(false);
  };

  const handleEditExercise = (exercise: CustomExercise) => {
    setEditingExercise(exercise);
    setShowCreateForm(true);
  };

  const handleUpdateExercise = (data: CustomExerciseFormData) => {
    if (editingExercise?.id) {
      updateCustomExercise({
        id: editingExercise.id,
        updates: data,
      });
    }
    setEditingExercise(null);
    setShowCreateForm(false);
  };

  const handleDeleteExercise = (exercise: CustomExercise) => {
    if (exercise.id && window.confirm('Are you sure you want to delete this exercise?')) {
      deleteCustomExercise(exercise.id);
      setShowExerciseDetail(false);
    }
  };

  const isCustom = (exercise: ExerciseLibraryItem | CustomExercise): exercise is CustomExercise => {
    return 'is_custom' in exercise && exercise.is_custom;
  };

  return (
    <div className={styles.exerciseLibrary}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Exercise Library</h1>
          <p className={styles.subtitle}>
            Browse exercises and create custom ones for your workouts
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create Custom Exercise
        </Button>
      </div>

      <ExerciseFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterOptions={filterOptions}
        resultCount={displayedExercises.length}
        totalCount={allExercises.length}
      />

      <div className={styles.exerciseGrid}>
        {displayedExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.slug}
            exercise={exercise}
            locale={locale}
            onViewDetails={() => handleViewDetails(exercise)}
            onEdit={isCustom(exercise) ? () => handleEditExercise(exercise) : undefined}
            onDelete={isCustom(exercise) ? () => handleDeleteExercise(exercise) : undefined}
            showActions={true}
          />
        ))}
      </div>

      {displayedExercises.length === 0 && (
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
        onEdit={
          selectedExercise && isCustom(selectedExercise)
            ? () => {
                handleEditExercise(selectedExercise);
                setShowExerciseDetail(false);
              }
            : undefined
        }
        onDelete={
          selectedExercise && isCustom(selectedExercise)
            ? () => handleDeleteExercise(selectedExercise)
            : undefined
        }
        locale={locale}
      />

      {/* Create/Edit Exercise Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingExercise(null);
        }}
        size="lg"
      >
        <CustomExerciseForm
          exercise={editingExercise || undefined}
          onSubmit={editingExercise ? handleUpdateExercise : handleCreateExercise}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingExercise(null);
          }}
          isLoading={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;