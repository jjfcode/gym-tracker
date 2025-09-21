import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExerciseService } from '../services/exerciseService';
import { supabase } from '../../../lib/supabase';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
      })),
    },
  },
}));

describe('ExerciseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate a valid slug from exercise name', () => {
      expect(ExerciseService.generateSlug('Push-ups')).toBe('push-ups');
      expect(ExerciseService.generateSlug('Dumbbell Bench Press')).toBe('dumbbell-bench-press');
      expect(ExerciseService.generateSlug('Leg Extension (Machine)')).toBe('leg-extension-machine');
      expect(ExerciseService.generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(ExerciseService.generateSlug('Exercise & Movement')).toBe('exercise-movement');
      expect(ExerciseService.generateSlug('Test@#$%Exercise')).toBe('testexercise');
    });

    it('should handle empty or invalid input', () => {
      expect(ExerciseService.generateSlug('')).toBe('');
      expect(ExerciseService.generateSlug('   ')).toBe('');
    });
  });

  describe('createCustomExercise', () => {
    it('should create a custom exercise successfully', async () => {
      const mockExercise = {
        user_id: 'test-user-id',
        slug: 'test-exercise',
        name_en: 'Test Exercise',
        name_es: 'Ejercicio de Prueba',
        muscle_groups: ['chest'],
        equipment: 'dumbbell' as const,
        instructions_en: 'Test instructions',
        instructions_es: 'Instrucciones de prueba',
        difficulty_level: 'beginner' as const,
        is_compound: false,
        is_custom: true as const,
      };

      const mockResponse = { ...mockExercise, id: 1, created_at: '2024-01-01' };

      const mockChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
        })),
      };

      const mockInsert = vi.fn(() => mockChain);
      const mockFrom = vi.fn(() => ({ insert: mockInsert }));
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ExerciseService.createCustomExercise(mockExercise);

      expect(mockFrom).toHaveBeenCalledWith('custom_exercises');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockExercise.user_id,
        slug: mockExercise.slug,
        name_en: mockExercise.name_en,
        name_es: mockExercise.name_es,
        muscle_groups: mockExercise.muscle_groups,
        equipment: mockExercise.equipment,
        instructions_en: mockExercise.instructions_en,
        instructions_es: mockExercise.instructions_es,
        difficulty_level: mockExercise.difficulty_level,
        is_compound: mockExercise.is_compound,
        variations: [],
        media_url: undefined,
      });
      
      expect(result).toEqual({ ...mockResponse, is_custom: true });
    });

    it('should handle creation errors', async () => {
      const mockExercise = {
        user_id: 'test-user-id',
        slug: 'test-exercise',
        name_en: 'Test Exercise',
        name_es: 'Ejercicio de Prueba',
        muscle_groups: ['chest'],
        equipment: 'dumbbell' as const,
        instructions_en: 'Test instructions',
        instructions_es: 'Instrucciones de prueba',
        difficulty_level: 'beginner' as const,
        is_compound: false,
        is_custom: true as const,
      };

      const mockChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Duplicate slug' } 
          }),
        })),
      };

      const mockInsert = vi.fn(() => mockChain);
      const mockFrom = vi.fn(() => ({ insert: mockInsert }));
      
      (supabase.from as any).mockImplementation(mockFrom);

      await expect(ExerciseService.createCustomExercise(mockExercise))
        .rejects.toThrow('Failed to create custom exercise: Duplicate slug');
    });
  });

  describe('validateExerciseSlug', () => {
    it('should return true for available slug', async () => {
      const mockChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }),
          })),
        })),
      };

      const mockSelect = vi.fn(() => mockChain);
      const mockFrom = vi.fn(() => ({ select: mockSelect }));
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ExerciseService.validateExerciseSlug('available-slug', 'user-id');

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('custom_exercises');
      expect(mockSelect).toHaveBeenCalledWith('id');
    });

    it('should return false for unavailable slug', async () => {
      const mockChain = {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: { id: 1 }, 
              error: null 
            }),
          })),
        })),
      };

      const mockSelect = vi.fn(() => mockChain);
      const mockFrom = vi.fn(() => ({ select: mockSelect }));
      
      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ExerciseService.validateExerciseSlug('taken-slug', 'user-id');

      expect(result).toBe(false);
    });
  });
});