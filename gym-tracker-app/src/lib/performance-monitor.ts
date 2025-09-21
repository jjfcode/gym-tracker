// Performance monitoring utilities
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

export interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  navigationStart: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private navigationTiming: Partial<NavigationTiming> = {};

  constructor() {
    this.initializeObservers();
    this.measureNavigationTiming();
  }

  private initializeObservers() {
    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // FCP Observer
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }
  }

  private measureNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        this.navigationTiming = {
          navigationStart: timing.navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
        };

        // TTFB
        this.metrics.ttfb = timing.responseStart - timing.navigationStart;
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getNavigationTiming(): Partial<NavigationTiming> {
    return { ...this.navigationTiming };
  }

  public measureResourceTiming(): PerformanceResourceTiming[] {
    if ('performance' in window && 'getEntriesByType' in performance) {
      return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    }
    return [];
  }

  public measureMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  public logPerformanceReport() {
    const report = {
      coreWebVitals: this.getMetrics(),
      navigationTiming: this.getNavigationTiming(),
      resourceTiming: this.measureResourceTiming().slice(0, 10), // Top 10 resources
      memoryUsage: this.measureMemoryUsage(),
      timestamp: new Date().toISOString(),
    };

    console.group('🚀 Performance Report');
    console.table(report.coreWebVitals);
    console.table(report.navigationTiming);
    console.log('Memory Usage:', report.memoryUsage);
    console.groupEnd();

    return report;
  }

  public async sendPerformanceData(endpoint?: string) {
    if (!endpoint) return;

    const report = {
      coreWebVitals: this.getMetrics(),
      navigationTiming: this.getNavigationTiming(),
      memoryUsage: this.measureMemoryUsage(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.warn('Failed to send performance data:', error);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for React components
export const usePerformanceMonitoring = () => {
  const logReport = () => performanceMonitor.logPerformanceReport();
  const getMetrics = () => performanceMonitor.getMetrics();
  const getNavigationTiming = () => performanceMonitor.getNavigationTiming();

  return {
    logReport,
    getMetrics,
    getNavigationTiming,
  };
};

// Bundle size analyzer helper
export const analyzeBundleSize = () => {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('node_modules')
    );

    const bundleAnalysis = jsResources.map(resource => ({
      name: resource.name.split('/').pop(),
      size: resource.transferSize,
      loadTime: resource.responseEnd - resource.requestStart,
    }));

    console.table(bundleAnalysis);
    return bundleAnalysis;
  }
  return [];
};