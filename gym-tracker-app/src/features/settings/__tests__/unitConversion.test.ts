import { describe, it, expect } from 'vitest';
import {
  convertWeight,
  formatWeight,
  convertHeight,
  formatHeight,
  convertDistance,
  formatDistance,
  getWeightUnit,
  getHeightUnit,
  getDistanceUnit,
  getInputStep,
  getInputLimits,
} from '../utils/unitConversion';

describe('Unit Conversion Utilities', () => {
  describe('convertWeight', () => {
    it('should convert lbs to kg', () => {
      expect(convertWeight(220, 'imperial', 'metric')).toBeCloseTo(99.79, 2);
    });

    it('should convert kg to lbs', () => {
      expect(convertWeight(100, 'metric', 'imperial')).toBeCloseTo(220.46, 2);
    });

    it('should return same value for same units', () => {
      expect(convertWeight(100, 'metric', 'metric')).toBe(100);
      expect(convertWeight(200, 'imperial', 'imperial')).toBe(200);
    });
  });

  describe('formatWeight', () => {
    it('should format metric weight', () => {
      expect(formatWeight(70.5, 'metric')).toBe('70.5 kg');
    });

    it('should format imperial weight', () => {
      expect(formatWeight(155.2, 'imperial')).toBe('155.2 lbs');
    });

    it('should respect precision parameter', () => {
      expect(formatWeight(70.567, 'metric', 0)).toBe('71 kg');
      expect(formatWeight(70.567, 'metric', 2)).toBe('70.57 kg');
    });
  });

  describe('convertHeight', () => {
    it('should convert inches to cm', () => {
      expect(convertHeight(70, 'imperial', 'metric')).toBeCloseTo(177.8, 1);
    });

    it('should convert cm to inches', () => {
      expect(convertHeight(180, 'metric', 'imperial')).toBeCloseTo(70.87, 2);
    });

    it('should return same value for same units', () => {
      expect(convertHeight(180, 'metric', 'metric')).toBe(180);
      expect(convertHeight(70, 'imperial', 'imperial')).toBe(70);
    });
  });

  describe('formatHeight', () => {
    it('should format metric height', () => {
      expect(formatHeight(175.5, 'metric')).toBe('176 cm');
    });

    it('should format imperial height', () => {
      expect(formatHeight(70, 'imperial')).toBe('5\'10"');
      expect(formatHeight(72, 'imperial')).toBe('6\'0"');
      expect(formatHeight(73, 'imperial')).toBe('6\'1"');
    });
  });

  describe('convertDistance', () => {
    it('should convert miles to km', () => {
      expect(convertDistance(5, 'imperial', 'metric')).toBeCloseTo(8.05, 2);
    });

    it('should convert km to miles', () => {
      expect(convertDistance(10, 'metric', 'imperial')).toBeCloseTo(6.21, 2);
    });

    it('should return same value for same units', () => {
      expect(convertDistance(10, 'metric', 'metric')).toBe(10);
      expect(convertDistance(5, 'imperial', 'imperial')).toBe(5);
    });
  });

  describe('formatDistance', () => {
    it('should format metric distance', () => {
      expect(formatDistance(5.25, 'metric')).toBe('5.25 km');
    });

    it('should format imperial distance', () => {
      expect(formatDistance(3.14, 'imperial')).toBe('3.14 mi');
    });

    it('should respect precision parameter', () => {
      expect(formatDistance(5.12345, 'metric', 1)).toBe('5.1 km');
    });
  });

  describe('getWeightUnit', () => {
    it('should return correct weight units', () => {
      expect(getWeightUnit('metric')).toBe('kg');
      expect(getWeightUnit('imperial')).toBe('lbs');
    });
  });

  describe('getHeightUnit', () => {
    it('should return correct height units', () => {
      expect(getHeightUnit('metric')).toBe('cm');
      expect(getHeightUnit('imperial')).toBe('in');
    });
  });

  describe('getDistanceUnit', () => {
    it('should return correct distance units', () => {
      expect(getDistanceUnit('metric')).toBe('km');
      expect(getDistanceUnit('imperial')).toBe('mi');
    });
  });

  describe('getInputStep', () => {
    it('should return correct steps for weight', () => {
      expect(getInputStep('metric', 'weight')).toBe(0.5);
      expect(getInputStep('imperial', 'weight')).toBe(1);
    });

    it('should return correct steps for height', () => {
      expect(getInputStep('metric', 'height')).toBe(1);
      expect(getInputStep('imperial', 'height')).toBe(1);
    });

    it('should return correct steps for distance', () => {
      expect(getInputStep('metric', 'distance')).toBe(0.1);
      expect(getInputStep('imperial', 'distance')).toBe(0.1);
    });
  });

  describe('getInputLimits', () => {
    it('should return correct limits for weight', () => {
      const metricLimits = getInputLimits('metric', 'weight');
      expect(metricLimits.min).toBe(20);
      expect(metricLimits.max).toBe(300);

      const imperialLimits = getInputLimits('imperial', 'weight');
      expect(imperialLimits.min).toBe(44);
      expect(imperialLimits.max).toBe(661);
    });

    it('should return correct limits for height', () => {
      const metricLimits = getInputLimits('metric', 'height');
      expect(metricLimits.min).toBe(100);
      expect(metricLimits.max).toBe(250);

      const imperialLimits = getInputLimits('imperial', 'height');
      expect(imperialLimits.min).toBe(39);
      expect(imperialLimits.max).toBe(98);
    });
  });
});