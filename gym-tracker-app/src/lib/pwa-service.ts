interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private installCallbacks: Array<(canInstall: boolean) => void> = [];
  private updateCallbacks: Array<(updateAvailable: boolean) => void> = [];

  constructor() {
    this.setupInstallPrompt();
    this.checkIfInstalled();
    this.setupUpdateListener();
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallCallbacks(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstallCallbacks(false);
    });
  }

  private checkIfInstalled(): void {
    // Check if app is running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check for iOS Safari standalone mode
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  private setupUpdateListener(): void {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.notifyUpdateCallbacks(true);
      });

      // Check for waiting service worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          this.notifyUpdateCallbacks(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyUpdateCallbacks(true);
              }
            });
          }
        });
      });
    }
  }

  private notifyInstallCallbacks(canInstall: boolean): void {
    this.installCallbacks.forEach(callback => callback(canInstall));
  }

  private notifyUpdateCallbacks(updateAvailable: boolean): void {
    this.updateCallbacks.forEach(callback => callback(updateAvailable));
  }

  // Public methods
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  onInstallAvailable(callback: (canInstall: boolean) => void): () => void {
    this.installCallbacks.push(callback);
    
    // Call immediately with current state
    callback(this.canInstall());
    
    return () => {
      const index = this.installCallbacks.indexOf(callback);
      if (index > -1) {
        this.installCallbacks.splice(index, 1);
      }
    };
  }

  onUpdateAvailable(callback: (updateAvailable: boolean) => void): () => void {
    this.updateCallbacks.push(callback);
    
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        // Tell the waiting service worker to skip waiting and become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        window.location.reload();
      }
    }
  }

  // Get PWA capabilities
  getPWACapabilities(): {
    canInstall: boolean;
    isInstalled: boolean;
    hasServiceWorker: boolean;
    isOnline: boolean;
    hasNotifications: boolean;
  } {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled,
      hasServiceWorker: 'serviceWorker' in navigator,
      isOnline: navigator.onLine,
      hasNotifications: 'Notification' in window,
    };
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  // Show notification (for future use)
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          badge: '/icons/icon-72x72.png',
          icon: '/icons/icon-192x192.png',
          ...options,
        });
      } else {
        new Notification(title, options);
      }
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();