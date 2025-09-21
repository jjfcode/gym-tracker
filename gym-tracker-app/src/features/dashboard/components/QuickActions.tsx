import React, { useState } from 'react';
import { Card, Button, Input, Modal } from '../../../components/ui';
import { useLogWeight } from '../hooks/useLogWeight';
import { useAppStore } from '../../../store';
import styles from './QuickActions.module.css';

const QuickActions: React.FC = () => {
  const { units } = useAppStore();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  
  const logWeightMutation = useLogWeight();

  const handleLogWeight = () => {
    if (weight && weightDate) {
      logWeightMutation.mutate({
        weight: parseFloat(weight),
        measured_at: weightDate,
      }, {
        onSuccess: () => {
          setShowWeightModal(false);
          setWeight('');
          setWeightDate(new Date().toISOString().split('T')[0]);
        },
      });
    }
  };

  const weightUnit = units === 'metric' ? 'kg' : 'lbs';

  return (
    <div className={styles.quickActions}>
      <h2 className={styles.title}>Quick Actions</h2>
      
      <div className={styles.actionsGrid}>
        <Card className={styles.actionCard} hoverable>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowWeightModal(true)}
          >
            Log Weight
          </Button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Navigate to planning view
              window.location.href = '/planning';
            }}
          >
            View Calendar
          </Button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Navigate to progress view
              window.location.href = '/progress';
            }}
          >
            View Progress
          </Button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Navigate to settings
              window.location.href = '/settings';
            }}
          >
            Settings
          </Button>
        </Card>
      </div>

      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Log Weight"
      >
        <div className={styles.weightModal}>
          <Input
            type="number"
            label={`Weight (${weightUnit})`}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Enter weight in ${weightUnit}`}
            step="0.1"
            fullWidth
          />
          
          <Input
            type="date"
            label="Date"
            value={weightDate}
            onChange={(e) => setWeightDate(e.target.value)}
            fullWidth
          />
          
          <div className={styles.modalActions}>
            <Button
              variant="ghost"
              onClick={() => setShowWeightModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogWeight}
              loading={logWeightMutation.isLoading}
              disabled={!weight || !weightDate}
            >
              Log Weight
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuickActions;