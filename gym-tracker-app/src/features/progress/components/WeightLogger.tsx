import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { useUpsertWeightLog } from '../hooks/useWeightData';
import styles from './WeightLogger.module.css';

export const WeightLogger: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const getCurrentDateString = (): string => {
    const dateStr = new Date().toISOString().split('T')[0];
    return dateStr!; // Assert it's not undefined
  };
  const [date, setDate] = useState<string>(getCurrentDateString());

  const logWeightMutation = useUpsertWeightLog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && date) {
      logWeightMutation.mutate({
        weight: Number(weight),
        measured_at: date,
        note: notes || undefined,
      }, {
        onSuccess: () => {
          // Reset form after successful submission
          setWeight('');
          setNotes('');
          setDate(getCurrentDateString());
        }
      });
    }
  };

  return (
    <Card className={styles['loggerCard']}>
      <h3>Log Your Weight</h3>
      
      <form onSubmit={handleSubmit} className={styles['form']}>
        <div className={styles['formRow']}>
          <div className={styles['formGroup']}>
            <label htmlFor="weight">Weight (kg)</label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              required
            />
          </div>
          
          <div className={styles['formGroup']}>
            <label htmlFor="date">Date</label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className={styles['formGroup']}>
          <label htmlFor="notes">Notes (optional)</label>
          <Input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this measurement"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          disabled={!weight || !date || logWeightMutation.isPending}
          className={styles['submitButton']}
        >
          {logWeightMutation.isPending ? 'Logging...' : 'Log Weight'}
        </Button>
      </form>
    </Card>
  );
};