import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../../components';
import type { OnboardingStepProps } from '../types';
// import { useAppStore } from '../../../store';
import styles from './WeightInputStep.module.css';

export const WeightInputStep: React.FC<OnboardingStepProps> = ({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep
}) => {
  // const { units: globalUnits, setUnits } = useAppStore();
  const [weight, setWeight] = useState(data.weight?.toString() || '');
  const [units, setLocalUnits] = useState<'metric' | 'imperial'>(data.units || 'imperial');
  const [error, setError] = useState('');

  // Update global units when local units change
  // useEffect(() => {
  //   setUnits(units);
  // }, [units, setUnits]);

  const validateWeight = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid weight');
      return false;
    }

    // Validate reasonable weight ranges
    if (units === 'metric') {
      if (numValue < 30 || numValue > 300) {
        setError('Weight should be between 30-300 kg');
        return false;
      }
    } else {
      if (numValue < 66 || numValue > 660) {
        setError('Weight should be between 66-660 lbs');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value);
    
    if (value) {
      validateWeight(value);
    } else {
      setError('');
    }
  };

  const handleUnitsChange = (newUnits: 'metric' | 'imperial') => {
    setLocalUnits(newUnits);
    
    // Convert existing weight if there is one
    if (weight) {
      const numWeight = parseFloat(weight);
      if (!isNaN(numWeight)) {
        let convertedWeight: number;
        if (units === 'metric' && newUnits === 'imperial') {
          // kg to lbs
          convertedWeight = numWeight * 2.20462;
        } else if (units === 'imperial' && newUnits === 'metric') {
          // lbs to kg
          convertedWeight = numWeight / 2.20462;
        } else {
          convertedWeight = numWeight;
        }
        setWeight(Math.round(convertedWeight * 10) / 10 + '');
      }
    }
  };

  const handleNext = () => {
    if (!weight) {
      setError('Please enter your weight');
      return;
    }

    if (!validateWeight(weight)) {
      return;
    }

    onNext({
      weight: parseFloat(weight),
      units
    });
  };

  const getWeightLabel = () => {
    return units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
  };

  const getPlaceholder = () => {
    return units === 'metric' ? 'e.g., 70' : 'e.g., 154';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.heading}>What's your current weight?</h2>
          <p className={styles.description}>
            This helps us track your progress and provide better recommendations.
          </p>
        </div>

        <div className={styles.form}>
          {/* Units Selection */}
          <div className={styles.unitsSection}>
            <label className={styles.unitsLabel}>Units</label>
            <div className={styles.unitsToggle}>
              <button
                type="button"
                className={`${styles.unitButton} ${units === 'metric' ? styles.active : ''}`}
                onClick={() => handleUnitsChange('metric')}
              >
                Metric (kg)
              </button>
              <button
                type="button"
                className={`${styles.unitButton} ${units === 'imperial' ? styles.active : ''}`}
                onClick={() => handleUnitsChange('imperial')}
              >
                Imperial (lbs)
              </button>
            </div>
          </div>

          {/* Weight Input */}
          <div className={styles.weightSection}>
            <Input
              label={getWeightLabel()}
              type="number"
              value={weight}
              onChange={handleWeightChange}
              placeholder={getPlaceholder()}
              error={error}
              size="lg"
              step={units === 'metric' ? '0.1' : '0.5'}
              min={units === 'metric' ? '30' : '66'}
              max={units === 'metric' ? '300' : '660'}
            />
          </div>

          <div className={styles.note}>
            <p className={styles.noteText}>
              💡 You can change your units preference anytime in settings.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button 
          variant="ghost" 
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!weight || !!error}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};