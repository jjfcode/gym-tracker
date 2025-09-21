import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExerciseSetService } from '../services/exerciseSetService';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(),
            single: vi.fn(),
            in: vi.fn(() => ({
              order: vi.fn(),
            })),
          })),
        })),
        in: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  },
}));

type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

describe('ExerciseSetService', () => {
  const mockUserId = 'test-user-id';
  const mockExerciseId = 1;
  const mockSetId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSet', () => {
    it('should create a new exercise set successfully', async () => {
      const mockSetData = {
        id: 1,
        user_id: mockUserId,
        exercise_id: mockExerciseId,
        set_index: 1,
        weight: 100,
        reps: 10,
        rpe: 8,
        notes: 'Good set',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockSupabaseChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockSetData, error: null }),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => mockSupabaseChain),
      } as any);

      const result = await ExerciseSetService.createSet(mockUserId, {
        exerciseId: mockExerciseId,
        setIndex: 1,
        weight: 100,
        reps: 10,
        rpe: 8,
        notes: 'Good set',
      });

      expect(result).toEqual(mockSetData);
      expect(supabase.from).toHaveBeenCalledWith('exercise_sets');
    });

    it('should throw error for invalid data', async () => {
      await expect(
        ExerciseSetService.createSet(mockUserId, {
          exerciseId: mockExerciseId,
          setIndex: 1,
          weight: -10, // Invalid weight
          reps: 10,
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      
      const mockSupabaseChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => mockSupabaseChain),
      } as any);

      await expect(
        ExerciseSetService.createSet(mockUserId, {
          exerciseId: mockExerciseId,
          setIndex: 1,
          weight: 100,
          reps: 10,
        })
      ).rejects.toThrow('Failed to create exercise set: Database error');
    });
  });

  describe('updateSet', () => {
    it('should update an existing exercise set successfully', async () => {
      const mockUpdatedSet = {
        id: mockSetId,
        user_id: mockUserId,
        exercise_id: mockExerciseId,
        set_index: 1,
        weight: 105,
        reps: 12,
        rpe: 9,
        notes: 'Updated set',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockSupabaseChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockUpdatedSet, error: null }),
            })),
          })),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => mockSupabaseChain),
      } as any);

      const result = await ExerciseSetService.updateSet(mockUserId, {
        setId: mockSetId,
        weight: 105,
        reps: 12,
        rpe: 9,
        notes: 'Updated set',
      });

      expect(result).toEqual(mockUpdatedSet);
    });
  });

  describe('getExerciseSets', () => {
    it('should fetch exercise sets successfully', async () => {
      const mockSets: ExerciseSet[] = [
        {
          id: 1,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 1,
          weight: 100,
          reps: 10,
          rpe: 8,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 2,
          weight: 105,
          reps: 8,
          rpe: 9,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSupabaseChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockSets, error: null }),
          })),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => mockSupabaseChain),
      } as any);

      const result = await ExerciseSetService.getExerciseSets(mockUserId, mockExerciseId);

      expect(result).toEqual(mockSets);
      expect(supabase.from).toHaveBeenCalledWith('exercise_sets');
    });
  });

  describe('calculateExerciseProgress', () => {
    it('should calculate progress correctly for completed sets', () => {
      const mockSets: ExerciseSet[] = [
        {
          id: 1,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 1,
          weight: 100,
          reps: 10,
          rpe: 8,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 2,
          weight: 105,
          reps: 8,
          rpe: 9,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const progress = ExerciseSetService.calculateExerciseProgress(mockSets, 3);

      expect(progress).toEqual({
        exerciseId: mockExerciseId,
        completedSets: 2,
        totalSets: 3,
        isCompleted: false,
        totalVolume: 1840, // (100 * 10) + (105 * 8)
        averageRpe: 8.5, // (8 + 9) / 2
      });
    });

    it('should handle incomplete sets', () => {
      const mockSets: ExerciseSet[] = [
        {
          id: 1,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 1,
          weight: 100,
          reps: 10,
          rpe: 8,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 2,
          weight: null,
          reps: null,
          rpe: null,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const progress = ExerciseSetService.calculateExerciseProgress(mockSets, 2);

      expect(progress).toEqual({
        exerciseId: mockExerciseId,
        completedSets: 1,
        totalSets: 2,
        isCompleted: false,
        totalVolume: 1000, // 100 * 10
        averageRpe: 8,
      });
    });

    it('should mark exercise as completed when all sets are done', () => {
      const mockSets: ExerciseSet[] = [
        {
          id: 1,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 1,
          weight: 100,
          reps: 10,
          rpe: 8,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          exercise_id: mockExerciseId,
          set_index: 2,
          weight: 105,
          reps: 8,
          rpe: 9,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const progress = ExerciseSetService.calculateExerciseProgress(mockSets, 2);

      expect(progress.isCompleted).toBe(true);
      expect(progress.completedSets).toBe(2);
      expect(progress.totalSets).toBe(2);
    });
  });

  describe('upsertSet', () => {
    it('should update existing set when found', async () => {
      const existingSet = { id: mockSetId };
      const updatedSet = {
        id: mockSetId,
        user_id: mockUserId,
        exercise_id: mockExerciseId,
        set_index: 1,
        weight: 110,
        reps: 12,
        rpe: 8.5,
        notes: 'Updated',
        created_at: '2024-01-01T00:00:00Z',
      };

      // Mock finding existing set
      const mockSelectChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: existingSet, error: null }),
            })),
          })),
        })),
      };

      // Mock update operation
      const mockUpdateChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: updatedSet, error: null }),
            })),
          })),
        })),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: vi.fn(() => mockSelectChain),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn(() => mockUpdateChain),
        } as any);

      const result = await ExerciseSetService.upsertSet(
        mockUserId,
        mockExerciseId,
        1,
        { weight: 110, reps: 12, rpe: 8.5, notes: 'Updated' }
      );

      expect(result).toEqual(updatedSet);
    });

    it('should create new set when not found', async () => {
      const newSet = {
        id: 2,
        user_id: mockUserId,
        exercise_id: mockExerciseId,
        set_index: 1,
        weight: 100,
        reps: 10,
        rpe: 8,
        notes: 'New set',
        created_at: '2024-01-01T00:00:00Z',
      };

      // Mock not finding existing set
      const mockSelectChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            })),
          })),
        })),
      };

      // Mock create operation
      const mockInsertChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: newSet, error: null }),
        })),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: vi.fn(() => mockSelectChain),
        } as any)
        .mockReturnValueOnce({
          insert: vi.fn(() => mockInsertChain),
        } as any);

      const result = await ExerciseSetService.upsertSet(
        mockUserId,
        mockExerciseId,
        1,
        { weight: 100, reps: 10, rpe: 8, notes: 'New set' }
      );

      expect(result).toEqual(newSet);
    });
  });

  describe('deleteSet', () => {
    it('should delete exercise set successfully', async () => {
      const mockDeleteChain = {
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn(() => mockDeleteChain),
      } as any);

      await expect(
        ExerciseSetService.deleteSet(mockUserId, mockSetId)
      ).resolves.not.toThrow();

      expect(supabase.from).toHaveBeenCalledWith('exercise_sets');
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');
      const mockDeleteChain = {
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        })),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn(() => mockDeleteChain),
      } as any);

      await expect(
        ExerciseSetService.deleteSet(mockUserId, mockSetId)
      ).rejects.toThrow('Failed to delete exercise set: Delete failed');
    });
  });
});