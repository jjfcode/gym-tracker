import { useState, useEffect } from 'react';
import { usePWA } from '../../../contexts/PWAContext';
import { syncService } from '../../../lib/sync-service';
import { offlineStorage } from '../../../lib/offline-storage';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './PWASettings.module.css';

export function PWASettings() {
  const { 
    canInstall, 
    isInstalled, 
    promptInstall, 
    updateAvailable, 
    updateApp,
    isOnline,
    syncStatus,
    forcSync,
    capabilities 
  } = usePWA();

  const [storageInfo, setStorageInfo] = useState<{ [key: string]: number }>({});
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const loadStorageInfo = async () => {
      const info = await offlineStorage.getStorageSize();
      setStorageInfo(info);
      
      const lastSyncTime = await offlineStorage.getLastSync();
      if (lastSyncTime > 0) {
        setLastSync(new Date(lastSyncTime));
      }
    };

    loadStorageInfo();
  }, [syncStatus]);

  const handleInstall = async () => {
    await promptInstall();
  };

  const handleUpdate = async () => {
    await updateApp();
  };

  const handleSync = async () => {
    await forcSync();
  };

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      await syncService.clearOfflineData();
      setStorageInfo({});
      setLastSync(null);
    }
  };

  const getTotalStorageItems = () => {
    return Object.values(storageInfo).reduce((total, count) => total + count, 0);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Progressive Web App</h3>
      
      {/* Installation Status */}
      <Card className={styles.section}>
        <h4 className={styles.sectionTitle}>Installation</h4>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>App Status:</span>
          <span className={`${styles.statusValue} ${isInstalled ? styles.positive : styles.neutral}`}>
            {isInstalled ? '✅ Installed' : '📱 Web Version'}
          </span>
        </div>
        
        {canInstall && !isInstalled && (
          <div className={styles.actionRow}>
            <p className={styles.description}>
              Install Gym Tracker for faster access and offline functionality
            </p>
            <Button onClick={handleInstall} variant="primary" size="sm">
              Install App
            </Button>
          </div>
        )}
      </Card>

      {/* Update Status */}
      {updateAvailable && (
        <Card className={styles.section}>
          <h4 className={styles.sectionTitle}>Update Available</h4>
          <div className={styles.actionRow}>
            <p className={styles.description}>
              A new version of Gym Tracker is ready to install
            </p>
            <Button onClick={handleUpdate} variant="primary" size="sm">
              Update Now
            </Button>
          </div>
        </Card>
      )}

      {/* Sync Status */}
      <Card className={styles.section}>
        <h4 className={styles.sectionTitle}>Data Synchronization</h4>
        
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Connection:</span>
          <span className={`${styles.statusValue} ${isOnline ? styles.positive : styles.negative}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Sync Status:</span>
          <span className={`${styles.statusValue} ${
            syncStatus === 'synced' ? styles.positive : 
            syncStatus === 'error' ? styles.negative : 
            styles.neutral
          }`}>
            {syncStatus === 'syncing' && '🔄 Syncing...'}
            {syncStatus === 'synced' && '✅ Synced'}
            {syncStatus === 'error' && '❌ Error'}
            {syncStatus === 'idle' && '⏸️ Idle'}
          </span>
        </div>
        
        {lastSync && (
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Last Sync:</span>
            <span className={styles.statusValue}>
              {lastSync.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className={styles.actionRow}>
          <Button 
            onClick={handleSync} 
            variant="secondary" 
            size="sm"
            disabled={!isOnline || syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </Card>

      {/* Offline Storage */}
      <Card className={styles.section}>
        <h4 className={styles.sectionTitle}>Offline Storage</h4>
        
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Total Items:</span>
          <span className={styles.statusValue}>
            {getTotalStorageItems()} items stored
          </span>
        </div>
        
        {Object.entries(storageInfo).map(([store, count]) => (
          <div key={store} className={styles.storageRow}>
            <span className={styles.storageLabel}>{store}:</span>
            <span className={styles.storageValue}>{count}</span>
          </div>
        ))}
        
        <div className={styles.actionRow}>
          <Button 
            onClick={handleClearOfflineData} 
            variant="danger" 
            size="sm"
          >
            Clear Offline Data
          </Button>
        </div>
      </Card>

      {/* Capabilities */}
      <Card className={styles.section}>
        <h4 className={styles.sectionTitle}>PWA Capabilities</h4>
        
        <div className={styles.capabilitiesGrid}>
          <div className={styles.capability}>
            <span className={`${styles.capabilityIcon} ${capabilities.hasServiceWorker ? styles.positive : styles.negative}`}>
              {capabilities.hasServiceWorker ? '✅' : '❌'}
            </span>
            <span className={styles.capabilityLabel}>Service Worker</span>
          </div>
          
          <div className={styles.capability}>
            <span className={`${styles.capabilityIcon} ${capabilities.hasNotifications ? styles.positive : styles.negative}`}>
              {capabilities.hasNotifications ? '✅' : '❌'}
            </span>
            <span className={styles.capabilityLabel}>Notifications</span>
          </div>
          
          <div className={styles.capability}>
            <span className={`${styles.capabilityIcon} ${capabilities.isOnline ? styles.positive : styles.negative}`}>
              {capabilities.isOnline ? '✅' : '❌'}
            </span>
            <span className={styles.capabilityLabel}>Network</span>
          </div>
          
          <div className={styles.capability}>
            <span className={`${styles.capabilityIcon} ${capabilities.canInstall ? styles.positive : styles.neutral}`}>
              {capabilities.canInstall ? '✅' : '➖'}
            </span>
            <span className={styles.capabilityLabel}>Installable</span>
          </div>
        </div>
      </Card>
    </div>
  );
}