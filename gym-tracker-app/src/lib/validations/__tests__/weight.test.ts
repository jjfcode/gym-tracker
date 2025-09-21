import { describe, it, expect } from 'vitest';
import { weightLogSchema, weightGoalSchema } from '../weight';

describe('weight validation schemas', () => {
  describe('weightLogSchema', () => {
    it('should validate correct weight log data', () => {
      const validData = {
        weight: 180.5,
        measured_at: '2024-01-15',
        note: 'Feeling good today',
      };

      const result = weightLogSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate weight log without note', () => {
      const validData = {
        weight: 180.5,
        measured_at: '2024-01-15',
      };

      const result = weightLogSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate weight log with empty note', () => {
      const validData = {
        weight: 180.5,
        measured_at: '2024-01-15',
        note: '',
      };

      const result = weightLogSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weight below minimum', () => {
      const invalidData = {
        weight: 15,
        measured_at: '2024-01-15',
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20');
      }
    });

    it('should reject weight above maximum', () => {
      const invalidData = {
        weight: 900,
        measured_at: '2024-01-15',
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 800');
      }
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        weight: 180,
        measured_at: '01/15/2024',
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
      }
    });

    it('should reject note that is too long', () => {
      const invalidData = {
        weight: 180,
        measured_at: '2024-01-15',
        note: 'a'.repeat(501),
      };

      const result = weightLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 500');
      }
    });
  });

  describe('weightGoalSchema', () => {
    it('should validate correct weight goal data', () => {
      const validData = {
        target_weight: 175,
        target_date: '2024-06-01',
        goal_type: 'lose' as const,
      };

      const result = weightGoalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate weight goal without target date', () => {
      const validData = {
        target_weight: 175,
        goal_type: 'maintain' as const,
      };

      const result = weightGoalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid goal type', () => {
      const invalidData = {
        target_weight: 175,
        goal_type: 'invalid',
      };

      const result = weightGoalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject target weight below minimum', () => {
      const invalidData = {
        target_weight: 15,
        goal_type: 'lose' as const,
      };

      const result = weightGoalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20');
      }
    });

    it('should reject target weight above maximum', () => {
      const invalidData = {
        target_weight: 900,
        goal_type: 'gain' as const,
      };

      const result = weightGoalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 800');
      }
    });
  });
});