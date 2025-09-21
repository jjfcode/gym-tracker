import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from '../services/settingsService';
import { AuthService } from '../../../lib/auth';

// Mock the dependencies
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('../../../lib/auth', () => ({
  AuthService: {
    updateUserProfile: vi.fn(),
    fetchUserProfile: vi.fn(),
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        display_name: 'Test User',
        locale: 'en' as const,
        units: 'metric' as const,
        theme: 'dark' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      vi.mocked(AuthService.updateUserProfile).mockResolvedValue(mockProfile);

      const result = await SettingsService.updateProfile('test-user-id', {
        display_name: 'Test User',
        email: 'test@example.com',
      });

      expect(result).toEqual(mockProfile);
      expect(AuthService.updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        display_name: 'Test User',
      });
    });

    it('should throw error when profile update fails', async () => {
      vi.mocked(AuthService.updateUserProfile).mockResolvedValue(undefined);

      await expect(
        SettingsService.updateProfile('test-user-id', {
          display_name: 'Test User',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Failed to update profile');
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        display_name: 'Test User',
        locale: 'es' as const,
        units: 'imperial' as const,
        theme: 'light' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      vi.mocked(AuthService.updateUserProfile).mockResolvedValue(mockProfile);

      const result = await SettingsService.updatePreferences('test-user-id', {
        locale: 'es',
        units: 'imperial',
        theme: 'light',
      });

      expect(result).toEqual(mockProfile);
      expect(AuthService.updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        locale: 'es',
        units: 'imperial',
        theme: 'light',
      });
    });
  });

  describe('formatExportData', () => {
    const mockExportData = {
      profile: {
        user_id: 'test-user-id',
        display_name: 'Test User',
        locale: 'en' as const,
        units: 'metric' as const,
        theme: 'dark' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      workouts: [
        {
          id: 1,
          date: '2023-01-01',
          title: 'Test Workout',
          is_completed: true,
          duration_minutes: 60,
          notes: 'Great workout',
        },
      ],
      exercises: [],
      weightLogs: [
        {
          id: 1,
          user_id: 'test-user-id',
          measured_at: '2023-01-01',
          weight: 70,
          note: 'Morning weight',
          created_at: '2023-01-01T00:00:00Z',
        },
      ],
      plans: [],
      exportedAt: '2023-01-01T00:00:00Z',
    };

    it('should format data as JSON', () => {
      const result = SettingsService.formatExportData(mockExportData, 'json');
      expect(result).toBe(JSON.stringify(mockExportData, null, 2));
    });

    it('should format data as CSV', () => {
      const result = SettingsService.formatExportData(mockExportData, 'csv');
      expect(result).toContain('Export Data');
      expect(result).toContain('WORKOUTS');
      expect(result).toContain('WEIGHT_LOGS');
      expect(result).toContain('Test Workout');
      expect(result).toContain('Morning weight');
    });
  });

  describe('downloadExportData', () => {
    it('should create and trigger download', () => {
      // Mock DOM APIs
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      SettingsService.downloadExportData('test data', 'test-file', 'json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-file.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});