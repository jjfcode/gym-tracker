import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor, usePerformanceMonitoring, analyzeBundleSize } from '../../lib/performance-monitor';

// Mock performance APIs
const mockPerformanceObserver = vi.fn();
const mockPerformanceTiming = {
  navigationStart: 1000,
  responseStart: 1100,
  domContentLoadedEventEnd: 1500,
  loadEventEnd: 2000,
};

const mockPerformanceEntries = [
  {
    name: 'first-contentful-paint',
    startTime: 1200,
    entryType: 'paint',
  },
  {
    name: 'largest-contentful-paint',
    startTime: 1400,
    entryType: 'largest-contentful-paint',
  },
  {
    name: '/static/js/main.js',
    transferSize: 150000,
    responseEnd: 1300,
    requestStart: 1150,
    entryType: 'resource',
  },
];

beforeEach(() => {
  // Mock PerformanceObserver
  global.PerformanceObserver = mockPerformanceObserver.mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock performance.timing
  Object.defineProperty(global.performance, 'timing', {
    value: mockPerformanceTiming,
    writable: true,
  });

  // Mock performance.getEntriesByType
  global.performance.getEntriesByType = vi.fn().mockImplementation((type) => {
    if (type === 'resource') {
      return mockPerformanceEntries.filter(entry => entry.entryType === 'resource');
    }
    if (type === 'paint') {
      return mockPerformanceEntries.filter(entry => entry.entryType === 'paint');
    }
    return [];
  });

  // Mock performance.memory
  Object.defineProperty(global.performance, 'memory', {
    value: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 50000000,
    },
    writable: true,
  });
});

describe('Performance Monitor Integration', () => {
  it('should initialize performance monitoring', () => {
    expect(performanceMonitor).toBeDefined();
    expect(typeof performanceMonitor.getMetrics).toBe('function');
    expect(typeof performanceMonitor.getNavigationTiming).toBe('function');
  });

  it('should measure navigation timing correctly', () => {
    const navigationTiming = performanceMonitor.getNavigationTiming();
    
    // Since the constructor runs immediately, we need to simulate the load event
    window.dispatchEvent(new Event('load'));
    
    expect(navigationTiming).toBeDefined();
  });

  it('should measure resource timing', () => {
    const resourceTiming = performanceMonitor.measureResourceTiming();
    
    expect(Array.isArray(resourceTiming)).toBe(true);
    expect(resourceTiming.length).toBeGreaterThan(0);
    expect(resourceTiming[0]).toHaveProperty('name');
    expect(resourceTiming[0]).toHaveProperty('transferSize');
  });

  it('should measure memory usage', () => {
    const memoryUsage = performanceMonitor.measureMemoryUsage();
    
    expect(memoryUsage).toBeDefined();
    expect(memoryUsage).toHaveProperty('usedJSHeapSize');
    expect(memoryUsage).toHaveProperty('totalJSHeapSize');
    expect(memoryUsage).toHaveProperty('jsHeapSizeLimit');
  });

  it('should generate performance report', () => {
    const report = performanceMonitor.logPerformanceReport();
    
    expect(report).toBeDefined();
    expect(report).toHaveProperty('coreWebVitals');
    expect(report).toHaveProperty('navigationTiming');
    expect(report).toHaveProperty('resourceTiming');
    expect(report).toHaveProperty('memoryUsage');
    expect(report).toHaveProperty('timestamp');
  });

  it('should handle performance data sending', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    await performanceMonitor.sendPerformanceData('https://api.example.com/metrics');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/metrics',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('coreWebVitals'),
      })
    );
  });

  it('should handle fetch errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    await performanceMonitor.sendPerformanceData('https://api.example.com/metrics');
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to send performance data:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});

describe('Performance Hooks Integration', () => {
  it('should provide performance monitoring hooks', () => {
    const { logReport, getMetrics, getNavigationTiming } = usePerformanceMonitoring();
    
    expect(typeof logReport).toBe('function');
    expect(typeof getMetrics).toBe('function');
    expect(typeof getNavigationTiming).toBe('function');
  });

  it('should analyze bundle size correctly', () => {
    const bundleAnalysis = analyzeBundleSize();
    
    expect(Array.isArray(bundleAnalysis)).toBe(true);
    if (bundleAnalysis.length > 0) {
      expect(bundleAnalysis[0]).toHaveProperty('name');
      expect(bundleAnalysis[0]).toHaveProperty('size');
      expect(bundleAnalysis[0]).toHaveProperty('loadTime');
    }
  });
});