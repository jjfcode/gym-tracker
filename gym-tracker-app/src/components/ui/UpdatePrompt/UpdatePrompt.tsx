import { useState, useEffect } from 'react';
import { pwaService } from '../../../lib/pwa-service';
import Button from '../Button/Button';
import styles from './UpdatePrompt.module.css';

interface UpdatePromptProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export function UpdatePrompt({ onUpdate, onDismiss }: UpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaService.onUpdateAvailable((available) => {
      setUpdateAvailable(available);
      setIsVisible(available);
    });

    return unsubscribe;
  }, []);

  const handleUpdate = async () => {
    setIsVisible(false);
    await pwaService.updateApp();
    onUpdate?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!updateAvailable || !isVisible) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.info}>
          <span className={styles.icon}>🔄</span>
          <div className={styles.text}>
            <h4 className={styles.title}>Update Available</h4>
            <p className={styles.description}>
              A new version of Gym Tracker is ready to install
            </p>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={styles.dismissButton}
          >
            Later
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpdate}
            className={styles.updateButton}
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
}