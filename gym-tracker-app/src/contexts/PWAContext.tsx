import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pwaService } from '../lib/pwa-service';
import { syncService } from '../lib/sync-service';

interface PWAContextType {
  // Installation
  canInstall: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
  
  // Updates
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
  
  // Sync
  isOnline: boolean;
  syncStatus: 'syncing' | 'synced' | 'error' | 'idle';
  forcSync: () => Promise<void>;
  
  // Capabilities
  capabilities: {
    canInstall: boolean;
    isInstalled: boolean;
    hasServiceWorker: boolean;
    isOnline: boolean;
    hasNotifications: boolean;
  };
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error' | 'idle'>('idle');

  useEffect(() => {
    // Initialize PWA services
    const initializePWA = async () => {
      // Set initial states
      setIsInstalled(pwaService.isAppInstalled());
      setCanInstall(pwaService.canInstall());
    };

    initializePWA();

    // Set up listeners
    const unsubscribeInstall = pwaService.onInstallAvailable((available) => {
      setCanInstall(available);
    });

    const unsubscribeUpdate = pwaService.onUpdateAvailable((available) => {
      setUpdateAvailable(available);
    });

    const unsubscribeSync = syncService.onSyncStatusChange((status) => {
      setSyncStatus(status);
      
      // Reset to idle after showing status
      if (status === 'synced' || status === 'error') {
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      syncService.syncWhenOnline();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeInstall();
      unsubscribeUpdate();
      unsubscribeSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    const success = await pwaService.promptInstall();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return success;
  };

  const updateApp = async (): Promise<void> => {
    await pwaService.updateApp();
    setUpdateAvailable(false);
  };

  const forcSync = async (): Promise<void> => {
    await syncService.forcSync();
  };

  const capabilities = pwaService.getPWACapabilities();

  const value: PWAContextType = {
    canInstall,
    isInstalled,
    promptInstall,
    updateAvailable,
    updateApp,
    isOnline,
    syncStatus,
    forcSync,
    capabilities,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}