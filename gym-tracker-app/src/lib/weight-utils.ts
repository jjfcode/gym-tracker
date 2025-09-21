import type { Units } from '../store/appStore';
import type { WeightLog } from '../types/common';

// Conversion constants
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;

/**
 * Convert weight between units
 */
export const convertWeight = (weight: number, fromUnit: Units, toUnit: Units): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return weight * KG_TO_LBS;
  } else if (fromUnit === 'imperial' && toUnit === 'metric') {
    return weight * LBS_TO_KG;
  }
  
  return weight;
};

/**
 * Format weight with appropriate unit label
 */
export const formatWeight = (weight: number, unit: Units, decimals: number = 1): string => {
  const unitLabel = unit === 'metric' ? 'kg' : 'lbs';
  return `${weight.toFixed(decimals)} ${unitLabel}`;
};

/**
 * Get weight display value in user's preferred unit
 */
export const getDisplayWeight = (weight: number, userUnit: Units): number => {
  // Weight is stored in lbs in database, convert to user's preferred unit
  return convertWeight(weight, 'imperial', userUnit);
};

/**
 * Get storage weight value (always store in lbs)
 */
export const getStorageWeight = (weight: number, userUnit: Units): number => {
  // Convert from user's unit to lbs for storage
  return convertWeight(weight, userUnit, 'imperial');
};

/**
 * Calculate weight trend over time
 */
export const calculateWeightTrend = (weightLogs: WeightLog[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  changeAmount: number;
  changePercentage: number;
} => {
  if (weightLogs.length < 2) {
    return { trend: 'stable', changeAmount: 0, changePercentage: 0 };
  }

  // Sort by date to ensure proper order
  const sortedLogs = [...weightLogs].sort((a, b) => 
    new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const firstWeight = sortedLogs[0].weight;
  const lastWeight = sortedLogs[sortedLogs.length - 1].weight;
  
  const changeAmount = lastWeight - firstWeight;
  const changePercentage = (changeAmount / firstWeight) * 100;

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(changePercentage) < 1) {
    trend = 'stable';
  } else if (changeAmount > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }

  return {
    trend,
    changeAmount: Math.abs(changeAmount),
    changePercentage: Math.abs(changePercentage),
  };
};

/**
 * Calculate moving average for weight data
 */
export const calculateMovingAverage = (
  weightLogs: WeightLog[], 
  windowSize: number = 7
): Array<{ date: string; weight: number; average: number }> => {
  const sortedLogs = [...weightLogs].sort((a, b) => 
    new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  return sortedLogs.map((log, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = sortedLogs.slice(start, index + 1);
    const average = window.reduce((sum, item) => sum + item.weight, 0) / window.length;

    return {
      date: log.measured_at,
      weight: log.weight,
      average,
    };
  });
};

/**
 * Get weight statistics
 */
export const getWeightStats = (weightLogs: WeightLog[]): {
  current: number | null;
  highest: number | null;
  lowest: number | null;
  average: number | null;
  totalEntries: number;
} => {
  if (weightLogs.length === 0) {
    return {
      current: null,
      highest: null,
      lowest: null,
      average: null,
      totalEntries: 0,
    };
  }

  const sortedLogs = [...weightLogs].sort((a, b) => 
    new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  );

  const weights = weightLogs.map(log => log.weight);
  const current = sortedLogs[0].weight;
  const highest = Math.max(...weights);
  const lowest = Math.min(...weights);
  const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

  return {
    current,
    highest,
    lowest,
    average,
    totalEntries: weightLogs.length,
  };
};

/**
 * Format date for display
 * @deprecated Use useDateFormatter hook instead for i18n support
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};