import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseCard from '../components/ExerciseCard';
import type { ExerciseLibraryItem } from '../../../types/workout';

const mockExercise: ExerciseLibraryItem = {
  slug: 'push-ups',
  name_en: 'Push-ups',
  name_es: 'Flexiones',
  muscle_groups: ['chest', 'triceps', 'shoulders'],
  equipment: 'bodyweight',
  instructions_en: 'Start in a plank position. Lower your body until your chest nearly touches the floor.',
  instructions_es: 'Comienza en posición de plancha. Baja el cuerpo hasta que el pecho casi toque el suelo.',
  difficulty_level: 'beginner',
  is_compound: true,
};

const mockCustomExercise = {
  ...mockExercise,
  id: 1,
  user_id: 'test-user',
  is_custom: true as const,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('ExerciseCard', () => {
  it('should render exercise information correctly', () => {
    render(<ExerciseCard exercise={mockExercise} />);

    expect(screen.getByText('Push-ups')).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText('Compound')).toBeInTheDocument();
    expect(screen.getByText(/Chest, Triceps, Shoulders/)).toBeInTheDocument();
    expect(screen.getByText(/Bodyweight/)).toBeInTheDocument();
  });

  it('should render in Spanish locale', () => {
    render(<ExerciseCard exercise={mockExercise} locale="es" />);

    expect(screen.getByText('Flexiones')).toBeInTheDocument();
    expect(screen.getByText(/Comienza en posición de plancha/)).toBeInTheDocument();
  });

  it('should show custom badge for custom exercises', () => {
    render(<ExerciseCard exercise={mockCustomExercise} />);

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should handle select action', () => {
    const onSelect = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onSelect={onSelect} />);

    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should show selected state', () => {
    const onSelect = vi.fn();
    render(<ExerciseCard exercise={mockExercise} isSelected={true} onSelect={onSelect} />);

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('should show edit and delete buttons for custom exercises', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <ExerciseCard 
        exercise={mockCustomExercise} 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should handle edit action for custom exercises', () => {
    const onEdit = vi.fn();
    render(<ExerciseCard exercise={mockCustomExercise} onEdit={onEdit} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('should handle delete action for custom exercises', () => {
    const onDelete = vi.fn();
    render(<ExerciseCard exercise={mockCustomExercise} onDelete={onDelete} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should render in compact mode', () => {
    render(<ExerciseCard exercise={mockExercise} compact={true} />);

    // Instructions should not be visible in compact mode
    expect(screen.queryByText(/Start in a plank position/)).not.toBeInTheDocument();
  });

  it('should handle view details action', () => {
    const onViewDetails = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onViewDetails={onViewDetails} />);

    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should not show actions when showActions is false', () => {
    render(<ExerciseCard exercise={mockExercise} showActions={false} />);

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });
});