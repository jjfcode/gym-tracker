import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { useAuth } from '../../auth/AuthContext';
import { progressService } from '../../../lib/progress-service';
import styles from './WeightLogger.module.css';

export const WeightLogger: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const logWeightMutation = useMutation({
    mutationFn: () => progressService.logWeight(
      user!.id, 
      Number(weight), 
      date, 
      notes || undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
      queryClient.invalidateQueries({ queryKey: ['progressData'] });
      setWeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && date) {
      logWeightMutation.mutate();
    }
  };

  return (
    <Card className={styles.loggerCard}>
      <h3>Log Your Weight</h3>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
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
          
          <div className={styles.formGroup}>
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
        
        <div className={styles.formGroup}>
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
          className={styles.submitButton}
        >
          {logWeightMutation.isPending ? 'Logging...' : 'Log Weight'}
        </Button>
      </form>
    </Card>
  );
};