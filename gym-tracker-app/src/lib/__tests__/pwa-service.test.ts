import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pwaService } from '../pwa-service';

// Mock the global objects
const mockNavigator = {
  serviceWorker: {
    register: vi.fn(),
    ready: Promise.resolve({
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
    }),
    addEventListener: vi.fn(),
  },
  onLine: true,
};

const mockWindow = {
  addEventListener: vi.fn(),
  matchMedia: vi.fn(() => ({ matches: false })),
};

// Setup global mocks
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('PWAService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize without errors', () => {
    expect(pwaService).toBeDefined();
  });

  it('should return PWA capabilities', () => {
    const capabilities = pwaService.getPWACapabilities();
    
    expect(capabilities).toHaveProperty('canInstall');
    expect(capabilities).toHaveProperty('isInstalled');
    expect(capabilities).toHaveProperty('hasServiceWorker');
    expect(capabilities).toHaveProperty('isOnline');
    expect(capabilities).toHaveProperty('hasNotifications');
  });

  it('should detect if app is not installed initially', () => {
    expect(pwaService.isAppInstalled()).toBe(false);
  });

  it('should detect if install prompt is not available initially', () => {
    expect(pwaService.canInstall()).toBe(false);
  });
});