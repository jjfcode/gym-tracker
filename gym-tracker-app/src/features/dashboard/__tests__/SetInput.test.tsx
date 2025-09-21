import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetInput from '../components/SetInput';
import type { Database } from '../../../types/database';

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

describe('SetInput', () => {
  const mockOnUpdate = vi.fn();
  const defaultProps = {
    setIndex: 1,
    exerciseId: 123,
    onUpdate: mockOnUpdate,
    units: 'imperial' as const,
    targetReps: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with empty inputs initially', () => {
    render(<SetInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Weight')).toHaveValue('');
    expect(screen.getByPlaceholderText('Reps')).toHaveValue('');
    expect(screen.getByPlaceholderText('RPE')).toHaveValue('');
    expect(screen.getByPlaceholderText('Notes (optional)')).toHaveValue('');
    expect(screen.getByText('Set 1')).toBeInTheDocument();
  });

  it('renders with initial data', () => {
    const initialData: ExerciseSet = {
      id: 1,
      user_id: 'user-1',
      exercise_id: 123,
      set_index: 1,
      weight: 135,
      reps: 8,
      rpe: 8.5,
      notes: 'Good set',
      created_at: '2024-01-01T00:00:00Z',
    };

    render(<SetInput {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('135')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Good set')).toBeInTheDocument();
  });

  it('shows completed state when weight and reps are present', () => {
    const initialData: ExerciseSet = {
      id: 1,
      user_id: 'user-1',
      exercise_id: 123,
      set_index: 1,
      weight: 135,
      reps: 8,
      rpe: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    render(<SetInput {...defaultProps} initialData={initialData} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('displays correct weight unit', () => {
    render(<SetInput {...defaultProps} units="metric" />);
    expect(screen.getByText('kg')).toBeInTheDocument();

    render(<SetInput {...defaultProps} units="imperial" />);
    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('validates weight input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    
    await user.type(weightInput, '-10');
    
    await waitFor(() => {
      expect(screen.getByText('Weight must be a positive number')).toBeInTheDocument();
    });
  });

  it('validates reps input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    
    await user.type(repsInput, '0');
    
    await waitFor(() => {
      expect(screen.getByText('Reps must be a positive whole number')).toBeInTheDocument();
    });
  });

  it('validates RPE input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const rpeInput = screen.getByPlaceholderText('RPE');
    
    await user.type(rpeInput, '11');
    
    await waitFor(() => {
      expect(screen.getByText('RPE must be between 1 and 10')).toBeInTheDocument();
    });
  });

  it('validates notes length', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const notesInput = screen.getByPlaceholderText('Notes (optional)');
    const longText = 'a'.repeat(501);
    
    await user.type(notesInput, longText);
    
    await waitFor(() => {
      expect(screen.getByText('Notes must be less than 500 characters')).toBeInTheDocument();
    });
  });

  it('shows save button when autoSave is disabled and there are changes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    await user.type(weightInput, '100');

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('calls onUpdate when save button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    const repsInput = screen.getByPlaceholderText('Reps');
    
    await user.type(weightInput, '100');
    await user.type(repsInput, '10');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      exercise_id: 123,
      set_index: 1,
      weight: 100,
      reps: 10,
      rpe: null,
      notes: null,
    });
  });

  it('auto-saves after delay when autoSave is enabled', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={true} autoSaveDelay={500} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    await user.type(weightInput, '100');

    // Advance timers to trigger auto-save
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        exercise_id: 123,
        set_index: 1,
        weight: 100,
        reps: null,
        rpe: null,
        notes: null,
      });
    });
  });

  it('shows auto-save indicator when auto-save is enabled', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={true} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    await user.type(weightInput, '100');

    await waitFor(() => {
      expect(screen.getByText('Auto-save')).toBeInTheDocument();
    });
  });

  it('handles quick complete functionality', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const initialData: ExerciseSet = {
      id: 1,
      user_id: 'user-1',
      exercise_id: 123,
      set_index: 1,
      weight: 135,
      reps: null,
      rpe: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    render(<SetInput {...defaultProps} initialData={initialData} autoSave={false} />);

    const quickCompleteButton = screen.getByText('Quick Complete');
    await user.click(quickCompleteButton);

    // Should use previous weight and target reps
    await waitFor(() => {
      expect(screen.getByDisplayValue('135')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });
  });

  it('disables save button when there are validation errors', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    await user.type(weightInput, '-10');

    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });
  });

  it('disables inputs when loading', () => {
    render(<SetInput {...defaultProps} isLoading={true} autoSave={false} />);

    const quickCompleteButton = screen.getByText('Quick Complete');
    expect(quickCompleteButton).toBeDisabled();
  });

  it('handles decimal values for weight and RPE', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const weightInput = screen.getByPlaceholderText('Weight');
    const rpeInput = screen.getByPlaceholderText('RPE');
    
    await user.type(weightInput, '135.5');
    await user.type(rpeInput, '8.5');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      exercise_id: 123,
      set_index: 1,
      weight: 135.5,
      reps: null,
      rpe: 8.5,
      notes: null,
    });
  });

  it('handles empty inputs correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SetInput {...defaultProps} autoSave={false} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    await user.type(repsInput, '10');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      exercise_id: 123,
      set_index: 1,
      weight: null,
      reps: 10,
      rpe: null,
      notes: null,
    });
  });

  it('updates inputs when initialData changes', () => {
    const initialData: ExerciseSet = {
      id: 1,
      user_id: 'user-1',
      exercise_id: 123,
      set_index: 1,
      weight: 100,
      reps: 8,
      rpe: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    const { rerender } = render(<SetInput {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();

    const updatedData: ExerciseSet = {
      ...initialData,
      weight: 110,
      reps: 10,
    };

    rerender(<SetInput {...defaultProps} initialData={updatedData} />);

    expect(screen.getByDisplayValue('110')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });
});