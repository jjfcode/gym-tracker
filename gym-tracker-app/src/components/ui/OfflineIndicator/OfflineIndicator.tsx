import { useState, useEffect } from 'react';
import { syncService } from '../../../lib/sync-service';
import styles from './OfflineIndicator.module.css';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error' | 'idle'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncService.onSyncStatusChange((status) => {
      setSyncStatus(status);
      
      // Reset to idle after showing sync status
      if (status === 'synced' || status === 'error') {
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (isOnline && syncStatus === 'idle') {
    return null;
  }

  const getIndicatorContent = () => {
    if (!isOnline) {
      return {
        text: 'Offline',
        icon: '📴',
        className: styles.offline,
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          text: 'Syncing...',
          icon: '🔄',
          className: styles.syncing,
        };
      case 'synced':
        return {
          text: 'Synced',
          icon: '✅',
          className: styles.synced,
        };
      case 'error':
        return {
          text: 'Sync Error',
          icon: '⚠️',
          className: styles.error,
        };
      default:
        return null;
    }
  };

  const content = getIndicatorContent();
  if (!content) return null;

  return (
    <div className={`${styles.indicator} ${content.className} ${className || ''}`}>
      <span className={styles.icon}>{content.icon}</span>
      <span className={styles.text}>{content.text}</span>
    </div>
  );
}