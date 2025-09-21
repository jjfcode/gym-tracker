import { useMemo, useState, useCallback } from 'react';
import type { 
  ExerciseLibraryItem, 
  MuscleGroup, 
  Equipment 
} from '../types/workout';
import { ExerciseLibrary } from '../lib';

export interface ExerciseFilters {
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: ('beginner' | 'intermediate' | 'advanced')[];
  compoundOnly: boolean;
  searchQuery: string;
}

export function useExerciseLibrary() {
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    compoundOnly: false,
    searchQuery: '',
  });

  const allExercises = useMemo(() => {
    return ExerciseLibrary.getAll();
  }, []);

  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    // Apply search query first
    if (filters.searchQuery.trim()) {
      exercises = ExerciseLibrary.search(filters.searchQuery.trim());
    }

    // Apply other filters
    if (filters.muscleGroups.length > 0 || 
        filters.equipment.length > 0 || 
        filters.difficulty.length > 0 || 
        filters.compoundOnly) {
      exercises = ExerciseLibrary.filterExercises({
        muscleGroups: filters.muscleGroups.length > 0 ? filters.muscleGroups : undefined,
        equipment: filters.equipment.length > 0 ? filters.equipment : undefined,
        difficulty: filters.difficulty.length > 0 ? filters.difficulty : undefined,
        compoundOnly: filters.compoundOnly || undefined,
      });
    }

    return exercises;
  }, [allExercises, filters]);

  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      muscleGroups: [],
      equipment: [],
      difficulty: [],
      compoundOnly: false,
      searchQuery: '',
    });
  }, []);

  const getExerciseBySlug = useCallback((slug: string): ExerciseLibraryItem | undefined => {
    return ExerciseLibrary.getBySlug(slug);
  }, []);

  const getExercisesByMuscleGroup = useCallback((muscleGroup: MuscleGroup): ExerciseLibraryItem[] => {
    return ExerciseLibrary.getByMuscleGroup(muscleGroup);
  }, []);

  const getExercisesByEquipment = useCallback((equipment: Equipment): ExerciseLibraryItem[] => {
    return ExerciseLibrary.getByEquipment(equipment);
  }, []);

  const getCompoundExercises = useCallback((): ExerciseLibraryItem[] => {
    return ExerciseLibrary.getCompoundExercises();
  }, []);

  const searchExercises = useCallback((query: string, locale: 'en' | 'es' = 'en'): ExerciseLibraryItem[] => {
    return ExerciseLibrary.search(query, locale);
  }, []);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const muscleGroups = new Set<MuscleGroup>();
    const equipment = new Set<Equipment>();
    const difficulties = new Set<'beginner' | 'intermediate' | 'advanced'>();

    allExercises.forEach(exercise => {
      exercise.muscle_groups.forEach(mg => muscleGroups.add(mg));
      equipment.add(exercise.equipment);
      difficulties.add(exercise.difficulty_level);
    });

    return {
      muscleGroups: Array.from(muscleGroups).sort(),
      equipment: Array.from(equipment).sort(),
      difficulties: Array.from(difficulties).sort(),
    };
  }, [allExercises]);

  return {
    // Data
    allExercises,
    filteredExercises,
    filters,
    filterOptions,
    
    // Actions
    updateFilters,
    clearFilters,
    
    // Getters
    getExerciseBySlug,
    getExercisesByMuscleGroup,
    getExercisesByEquipment,
    getCompoundExercises,
    searchExercises,
    
    // Computed
    hasActiveFilters: filters.muscleGroups.length > 0 || 
                     filters.equipment.length > 0 || 
                     filters.difficulty.length > 0 || 
                     filters.compoundOnly || 
                     filters.searchQuery.trim() !== '',
    exerciseCount: filteredExercises.length,
    totalExerciseCount: allExercises.length,
  };
}

export function useExerciseSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return ExerciseLibrary.search(query.trim(), locale);
  }, [query, locale]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    locale,
    setLocale,
    results,
    clearSearch,
    hasResults: results.length > 0,
    hasQuery: query.trim() !== '',
  };
}