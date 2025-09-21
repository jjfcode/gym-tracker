import type { Units } from '../../../store/appStore';

// Weight conversion utilities
export const convertWeight = (weight: number, fromUnit: Units, toUnit: Units): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // lbs to kg
    return weight * 0.453592;
  } else if (fromUnit === 'metric' && toUnit === 'imperial') {
    // kg to lbs
    return weight * 2.20462;
  }
  
  return weight;
};

// Format weight with appropriate unit
export const formatWeight = (weight: number, unit: Units, precision: number = 1): string => {
  const unitLabel = unit === 'metric' ? 'kg' : 'lbs';
  return `${weight.toFixed(precision)} ${unitLabel}`;
};

// Height conversion utilities
export const convertHeight = (height: number, fromUnit: Units, toUnit: Units): number => {
  if (fromUnit === toUnit) return height;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // inches to cm
    return height * 2.54;
  } else if (fromUnit === 'metric' && toUnit === 'imperial') {
    // cm to inches
    return height / 2.54;
  }
  
  return height;
};

// Format height with appropriate unit
export const formatHeight = (height: number, unit: Units): string => {
  if (unit === 'metric') {
    return `${Math.round(height)} cm`;
  } else {
    // Convert to feet and inches
    const totalInches = Math.round(height);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }
};

// Distance conversion utilities
export const convertDistance = (distance: number, fromUnit: Units, toUnit: Units): number => {
  if (fromUnit === toUnit) return distance;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // miles to km
    return distance * 1.60934;
  } else if (fromUnit === 'metric' && toUnit === 'imperial') {
    // km to miles
    return distance / 1.60934;
  }
  
  return distance;
};

// Format distance with appropriate unit
export const formatDistance = (distance: number, unit: Units, precision: number = 2): string => {
  const unitLabel = unit === 'metric' ? 'km' : 'mi';
  return `${distance.toFixed(precision)} ${unitLabel}`;
};

// Get unit labels
export const getWeightUnit = (unit: Units): string => {
  return unit === 'metric' ? 'kg' : 'lbs';
};

export const getHeightUnit = (unit: Units): string => {
  return unit === 'metric' ? 'cm' : 'in';
};

export const getDistanceUnit = (unit: Units): string => {
  return unit === 'metric' ? 'km' : 'mi';
};

// Conversion factors
export const CONVERSION_FACTORS = {
  weight: {
    lbsToKg: 0.453592,
    kgToLbs: 2.20462,
  },
  height: {
    inToCm: 2.54,
    cmToIn: 0.393701,
  },
  distance: {
    miToKm: 1.60934,
    kmToMi: 0.621371,
  },
} as const;

// Utility to get appropriate step values for inputs based on unit
export const getInputStep = (unit: Units, type: 'weight' | 'height' | 'distance'): number => {
  switch (type) {
    case 'weight':
      return unit === 'metric' ? 0.5 : 1; // 0.5 kg or 1 lb steps
    case 'height':
      return unit === 'metric' ? 1 : 1; // 1 cm or 1 inch steps
    case 'distance':
      return unit === 'metric' ? 0.1 : 0.1; // 0.1 km or 0.1 mile steps
    default:
      return 1;
  }
};

// Utility to get appropriate min/max values for inputs based on unit
export const getInputLimits = (unit: Units, type: 'weight' | 'height'): { min: number; max: number } => {
  switch (type) {
    case 'weight':
      return unit === 'metric' 
        ? { min: 20, max: 300 }   // 20-300 kg
        : { min: 44, max: 661 };  // 44-661 lbs (equivalent range)
    case 'height':
      return unit === 'metric'
        ? { min: 100, max: 250 }  // 100-250 cm
        : { min: 39, max: 98 };   // 39-98 inches (equivalent range)
    default:
      return { min: 0, max: 1000 };
  }
};