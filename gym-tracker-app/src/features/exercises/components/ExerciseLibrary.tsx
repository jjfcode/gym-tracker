import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner/LoadingSpinner';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseFilters } from './ExerciseFilters';
import { CreateExerciseModal } from './CreateExerciseModal';
import { useAuth } from '../../auth/AuthContext';
import { exerciseService } from '../../../lib/exercise-service';
import type { Exercise, ExerciseFilters as FilterType } from '../../../types/exercise';
import styles from './ExerciseLibrary.module.css';

const ExerciseLibrary: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterType>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Get exercises with filters
  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', user?.id, searchTerm, filters],
    queryFn: () => exerciseService.getExercises({
      userId: user!.id,
      search: searchTerm,
      ...filters
    }),
    enabled: !!user?.id,
  });

  // Get exercise categories
  const { data: categories } = useQuery({
    queryKey: ['exerciseCategories'],
    queryFn: () => exerciseService.getCategories(),
  });

  // Get muscle groups
  const { data: muscleGroups } = useQuery({
    queryKey: ['muscleGroups'],
    queryFn: () => exerciseService.getMuscleGroups(),
  });

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Exercise Library</h1>
          <p>Discover and manage exercises for your workouts</p>
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Exercise
          </Button>
        </div>
      </div>

      <div className={styles.searchAndFilters}>
        <div className={styles.searchBar}>
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <ExerciseFilters
          filters={filters}
          categories={categories}
          muscleGroups={muscleGroups}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.exerciseGrid}>
          {exercises?.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={handleExerciseSelect}
              isSelected={selectedExercise?.id === exercise.id}
            />
          ))}
        </div>

        {exercises?.length === 0 && (
          <Card className={styles.emptyState}>
            <h3>No exercises found</h3>
            <p>
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first exercise'
              }
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Exercise
            </Button>
          </Card>
        )}
      </div>

      {/* Exercise Details Sidebar */}
      {selectedExercise && (
        <div className={styles.sidebar}>
          <Card className={styles.exerciseDetails}>
            <div className={styles.detailsHeader}>
              <h3>{selectedExercise.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExercise(null)}
              >
                ✕
              </Button>
            </div>

            <div className={styles.exerciseInfo}>
              <div className={styles.infoSection}>
                <h4>Category</h4>
                <p>{selectedExercise.category}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Primary Muscles</h4>
                <div className={styles.muscleList}>
                  {selectedExercise.primary_muscles?.map((muscle) => (
                    <span key={muscle} className={styles.muscleTag}>
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {selectedExercise.secondary_muscles && selectedExercise.secondary_muscles.length > 0 && (
                <div className={styles.infoSection}>
                  <h4>Secondary Muscles</h4>
                  <div className={styles.muscleList}>
                    {selectedExercise.secondary_muscles.map((muscle) => (
                      <span key={muscle} className={styles.muscleTagSecondary}>
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedExercise.description && (
                <div className={styles.infoSection}>
                  <h4>Description</h4>
                  <p>{selectedExercise.description}</p>
                </div>
              )}

              {selectedExercise.instructions && (
                <div className={styles.infoSection}>
                  <h4>Instructions</h4>
                  <ol className={styles.instructionsList}>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className={styles.exerciseActions}>
                <Button variant="primary" size="sm">
                  Add to Workout
                </Button>
                <Button variant="outline" size="sm">
                  Add to Favorites
                </Button>
                {selectedExercise.created_by === user?.id && (
                  <Button variant="ghost" size="sm">
                    Edit Exercise
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <CreateExerciseModal
          onClose={() => setShowCreateModal(false)}
          categories={categories}
          muscleGroups={muscleGroups}
        />
      )}
    </div>
  );
};

export default ExerciseLibrary;