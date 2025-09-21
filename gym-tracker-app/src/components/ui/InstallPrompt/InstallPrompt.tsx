import { useState, useEffect } from 'react';
import { pwaService } from '../../../lib/pwa-service';
import Button from '../Button/Button';
import styles from './InstallPrompt.module.css';

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const unsubscribe = pwaService.onInstallAvailable((available) => {
      setCanInstall(available);
      
      // Show prompt after a delay if install is available
      if (available && !isDismissed) {
        setTimeout(() => setIsVisible(true), 3000);
      } else {
        setIsVisible(false);
      }
    });

    return unsubscribe;
  }, [isDismissed]);

  const handleInstall = async () => {
    const success = await pwaService.promptInstall();
    if (success) {
      setIsVisible(false);
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  if (!canInstall || !isVisible || isDismissed) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <div className={styles.header}>
          <div className={styles.icon}>📱</div>
          <h3 className={styles.title}>Install Gym Tracker</h3>
        </div>
        
        <p className={styles.description}>
          Install Gym Tracker on your device for quick access and offline functionality. 
          Track your workouts even without an internet connection!
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Faster loading</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📴</span>
            <span>Works offline</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏠</span>
            <span>Home screen access</span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className={styles.dismissButton}
          >
            Not now
          </Button>
          <Button
            variant="primary"
            onClick={handleInstall}
            className={styles.installButton}
          >
            Install App
          </Button>
        </div>
      </div>
    </div>
  );
}