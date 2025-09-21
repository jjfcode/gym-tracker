import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../../lib/supabase';
import {
  createWeightLog,
  updateWeightLog,
  deleteWeightLog,
  getWeightLogs,
  getLatestWeightLog,
  getWeightLogByDate,
  upsertWeightLog,
} from '../services/weightService';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const mockSupabaseFrom = vi.fn();
const mockSupabaseAuth = supabase.auth as any;
const mockSupabaseClient = supabase as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient.from = vi.fn(() => mockSupabaseFrom);
});

describe('weightService', () => {
  const mockUser = { id: 'test-user-id' };
  const mockWeightLog = {
    id: 1,
    user_id: 'test-user-id',
    weight: 180.5,
    measured_at: '2024-01-15',
    note: 'Test note',
    created_at: '2024-01-15T10:00:00Z',
  };

  describe('createWeightLog', () => {
    it('should create a weight log successfully', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockWeightLog,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const weightLogData = {
        weight: 180.5,
        measured_at: '2024-01-15',
        note: 'Test note',
      };

      const result = await createWeightLog(weightLogData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('weight_logs');
      expect(mockChain.insert).toHaveBeenCalledWith({
        ...weightLogData,
        user_id: mockUser.id,
      });
      expect(result).toEqual(mockWeightLog);
    });

    it('should throw error when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const weightLogData = {
        weight: 180.5,
        measured_at: '2024-01-15',
      };

      await expect(createWeightLog(weightLogData)).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error when database operation fails', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const weightLogData = {
        weight: 180.5,
        measured_at: '2024-01-15',
      };

      await expect(createWeightLog(weightLogData)).rejects.toThrow(
        'Failed to create weight log'
      );
    });
  });

  describe('getWeightLogs', () => {
    it('should fetch weight logs successfully', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockWeightLog],
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await getWeightLogs();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('weight_logs');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockChain.order).toHaveBeenCalledWith('measured_at', { ascending: false });
      expect(result).toEqual([mockWeightLog]);
    });
  });

  describe('getLatestWeightLog', () => {
    it('should fetch latest weight log successfully', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockWeightLog,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await getLatestWeightLog();

      expect(result).toEqual(mockWeightLog);
    });

    it('should return null when no data found', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No data found
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await getLatestWeightLog();

      expect(result).toBeNull();
    });
  });

  describe('upsertWeightLog', () => {
    it('should create new log when none exists for the date', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock getWeightLogByDate to return null (no existing log)
      const mockGetChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No data found
        }),
      };

      // Mock createWeightLog
      const mockCreateChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockWeightLog,
          error: null,
        }),
      };

      mockSupabaseFrom
        .mockReturnValueOnce(mockGetChain) // First call for getWeightLogByDate
        .mockReturnValueOnce(mockCreateChain); // Second call for createWeightLog

      const weightLogData = {
        weight: 180.5,
        measured_at: '2024-01-15',
        note: 'Test note',
      };

      const result = await upsertWeightLog(weightLogData);

      expect(result).toEqual(mockWeightLog);
    });
  });
});