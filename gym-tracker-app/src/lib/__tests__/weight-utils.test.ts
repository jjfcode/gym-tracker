import { describe, it, expect } from 'vitest';
import {
  convertWeight,
  formatWeight,
  getDisplayWeight,
  getStorageWeight,
  calculateWeightTrend,
  calculateMovingAverage,
  getWeightStats,
  getTodayDate,
} from '../weight-utils';
import type { WeightLog } from '../../types/common';

describe('weight-utils', () => {
  describe('convertWeight', () => {
    it('should convert kg to lbs correctly', () => {
      expect(convertWeight(100, 'metric', 'imperial')).toBeCloseTo(220.462, 2);
    });

    it('should convert lbs to kg correctly', () => {
      expect(convertWeight(220, 'imperial', 'metric')).toBeCloseTo(99.79, 2);
    });

    it('should return same weight when units are the same', () => {
      expect(convertWeight(100, 'metric', 'metric')).toBe(100);
      expect(convertWeight(200, 'imperial', 'imperial')).toBe(200);
    });
  });

  describe('formatWeight', () => {
    it('should format weight with correct unit labels', () => {
      expect(formatWeight(100, 'metric')).toBe('100.0 kg');
      expect(formatWeight(200, 'imperial')).toBe('200.0 lbs');
    });

    it('should respect decimal places', () => {
      expect(formatWeight(100.567, 'metric', 2)).toBe('100.57 kg');
      expect(formatWeight(100.567, 'imperial', 0)).toBe('101 lbs');
    });
  });

  describe('getDisplayWeight and getStorageWeight', () => {
    it('should convert between display and storage correctly', () => {
      const storageWeight = 200; // lbs
      const displayKg = getDisplayWeight(storageWeight, 'metric');
      const backToStorage = getStorageWeight(displayKg, 'metric');
      
      expect(backToStorage).toBeCloseTo(storageWeight, 2);
    });

    it('should handle imperial units (no conversion needed)', () => {
      const weight = 180;
      expect(getDisplayWeight(weight, 'imperial')).toBe(weight);
      expect(getStorageWeight(weight, 'imperial')).toBe(weight);
    });
  });

  describe('calculateWeightTrend', () => {
    const createWeightLog = (weight: number, date: string): WeightLog => ({
      id: Math.random(),
      user_id: 'test-user',
      weight,
      measured_at: date,
      created_at: new Date().toISOString(),
    });

    it('should return stable trend for single entry', () => {
      const logs = [createWeightLog(180, '2024-01-01')];
      const trend = calculateWeightTrend(logs);
      
      expect(trend.trend).toBe('stable');
      expect(trend.changeAmount).toBe(0);
      expect(trend.changePercentage).toBe(0);
    });

    it('should detect increasing trend', () => {
      const logs = [
        createWeightLog(180, '2024-01-01'),
        createWeightLog(185, '2024-01-15'),
      ];
      const trend = calculateWeightTrend(logs);
      
      expect(trend.trend).toBe('increasing');
      expect(trend.changeAmount).toBe(5);
      expect(trend.changePercentage).toBeCloseTo(2.78, 1);
    });

    it('should detect decreasing trend', () => {
      const logs = [
        createWeightLog(200, '2024-01-01'),
        createWeightLog(190, '2024-01-15'),
      ];
      const trend = calculateWeightTrend(logs);
      
      expect(trend.trend).toBe('decreasing');
      expect(trend.changeAmount).toBe(10);
      expect(trend.changePercentage).toBe(5);
    });

    it('should detect stable trend for small changes', () => {
      const logs = [
        createWeightLog(180, '2024-01-01'),
        createWeightLog(180.5, '2024-01-15'),
      ];
      const trend = calculateWeightTrend(logs);
      
      expect(trend.trend).toBe('stable');
    });
  });

  describe('calculateMovingAverage', () => {
    const createWeightLog = (weight: number, date: string): WeightLog => ({
      id: Math.random(),
      user_id: 'test-user',
      weight,
      measured_at: date,
      created_at: new Date().toISOString(),
    });

    it('should calculate moving average correctly', () => {
      const logs = [
        createWeightLog(180, '2024-01-01'),
        createWeightLog(182, '2024-01-02'),
        createWeightLog(181, '2024-01-03'),
      ];
      
      const result = calculateMovingAverage(logs, 2);
      
      expect(result).toHaveLength(3);
      expect(result[0].average).toBe(180); // First point
      expect(result[1].average).toBe(181); // (180 + 182) / 2
      expect(result[2].average).toBe(181.5); // (182 + 181) / 2
    });
  });

  describe('getWeightStats', () => {
    const createWeightLog = (weight: number, date: string): WeightLog => ({
      id: Math.random(),
      user_id: 'test-user',
      weight,
      measured_at: date,
      created_at: new Date().toISOString(),
    });

    it('should return null stats for empty array', () => {
      const stats = getWeightStats([]);
      
      expect(stats.current).toBeNull();
      expect(stats.highest).toBeNull();
      expect(stats.lowest).toBeNull();
      expect(stats.average).toBeNull();
      expect(stats.totalEntries).toBe(0);
    });

    it('should calculate stats correctly', () => {
      const logs = [
        createWeightLog(180, '2024-01-01'),
        createWeightLog(185, '2024-01-02'),
        createWeightLog(175, '2024-01-03'),
      ];
      
      const stats = getWeightStats(logs);
      
      expect(stats.current).toBe(175); // Most recent (by date)
      expect(stats.highest).toBe(185);
      expect(stats.lowest).toBe(175);
      expect(stats.average).toBeCloseTo(180, 1);
      expect(stats.totalEntries).toBe(3);
    });
  });

  describe('getTodayDate', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getTodayDate();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(today).toMatch(dateRegex);
      
      // Verify it's actually today
      const expectedDate = new Date().toISOString().split('T')[0];
      expect(today).toBe(expectedDate);
    });
  });
});