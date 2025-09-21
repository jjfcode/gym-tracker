import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '../../../../components/ui';
import { useAppStore } from '../../../../store/appStore';
import { useUpsertWeightLog, useWeightLogByDate } from '../../hooks/useWeightData';
import { weightLogSchema, type WeightLogFormData } from '../../../../lib/validations/weight';
import { getTodayDate, getStorageWeight, getDisplayWeight, formatWeight } from '../../../../lib/weight-utils';
import styles from './WeightLogger.module.css';

interface WeightLoggerProps {
  initialDate?: string;
  onSuccess?: (weightLog: any) => void;
  onCancel?: () => void;
  showDatePicker?: boolean;
  className?: string;
}

const WeightLogger: React.FC<WeightLoggerProps> = ({
  initialDate = getTodayDate(),
  onSuccess,
  onCancel,
  showDatePicker = true,
  className = '',
}) => {
  const { units } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  const { data: existingLog, isLoading: isLoadingExisting } = useWeightLogByDate(selectedDate);
  const upsertWeightLog = useUpsertWeightLog();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<WeightLogFormData>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: {
      measured_at: selectedDate,
      weight: 0,
      note: '',
    },
  });

  const watchedWeight = watch('weight');

  // Update form when existing log is loaded or date changes
  useEffect(() => {
    if (existingLog) {
      const displayWeight = getDisplayWeight(existingLog.weight, units);
      setValue('weight', displayWeight);
      setValue('note', existingLog.note || '');
    } else {
      setValue('weight', 0);
      setValue('note', '');
    }
    setValue('measured_at', selectedDate);
  }, [existingLog, selectedDate, units, setValue]);

  const onSubmit = async (data: WeightLogFormData) => {
    try {
      // Convert weight to storage format (lbs)
      const storageWeight = getStorageWeight(data.weight, units);
      
      const weightLogData = {
        ...data,
        weight: storageWeight,
        measured_at: selectedDate,
      };

      const result = await upsertWeightLog.mutateAsync(weightLogData);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Reset form on success if no custom handler
        reset();
        setSelectedDate(getTodayDate());
      }
    } catch (error) {
      console.error('Failed to save weight log:', error);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const unitLabel = units === 'metric' ? 'kg' : 'lbs';
  const isToday = selectedDate === getTodayDate();
  const isExistingEntry = Boolean(existingLog);

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isExistingEntry ? 'Update Weight' : 'Log Weight'}
        </h3>
        {showDatePicker && (
          <div className={styles.dateSection}>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={getTodayDate()}
              className={styles.dateInput}
              label="Date"
            />
            {isToday && <span className={styles.todayBadge}>Today</span>}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.weightSection}>
          <Input
            type="number"
            step="0.1"
            min="20"
            max={units === 'metric' ? '363' : '800'}
            placeholder={`Enter weight in ${unitLabel}`}
            label={`Weight (${unitLabel})`}
            error={errors.weight?.message}
            {...register('weight', { valueAsNumber: true })}
            className={styles.weightInput}
          />
          
          {watchedWeight > 0 && (
            <div className={styles.weightPreview}>
              <span className={styles.previewLabel}>Preview:</span>
              <span className={styles.previewValue}>
                {formatWeight(watchedWeight, units)}
              </span>
            </div>
          )}
        </div>

        <Input
          type="text"
          placeholder="Optional note about your weight..."
          label="Note (optional)"
          error={errors.note?.message}
          {...register('note')}
          className={styles.noteInput}
        />

        <div className={styles.actions}>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting || upsertWeightLog.isPending}
            disabled={isLoadingExisting}
          >
            {isExistingEntry ? 'Update Weight' : 'Save Weight'}
          </Button>
        </div>

        {upsertWeightLog.error && (
          <div className={styles.error} role="alert">
            Failed to save weight log. Please try again.
          </div>
        )}
      </form>
    </Card>
  );
};

export default WeightLogger;