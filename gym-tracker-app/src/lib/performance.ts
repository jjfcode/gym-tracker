/**
 * Performance optimization utilities and monitoring
 */

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark performance timing
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  // Measure performance between marks
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance === 'undefined') return null;

    try {
      const measurement = performance.measure(name, startMark, endMark);
      const duration = measurement.duration;
      this.metrics.set(name, duration);
      
      // Log slow operations in development
      if (import.meta.env.DEV && duration > 100) {
        console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Web Vitals monitoring
export class WebVitalsMonitor {
  private static vitals: Record<string, number> = {};

  static async initializeWebVitals(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Import web-vitals functions individually to handle potential import issues
      const webVitals = await import('web-vitals');
      
      if (webVitals.getCLS) {
        webVitals.getCLS((metric) => {
          this.vitals.CLS = metric.value;
          this.reportVital('CLS', metric.value, 0.1);
        });
      }

      if (webVitals.getFID) {
        webVitals.getFID((metric) => {
          this.vitals.FID = metric.value;
          this.reportVital('FID', metric.value, 100);
        });
      }

      if (webVitals.getFCP) {
        webVitals.getFCP((metric) => {
          this.vitals.FCP = metric.value;
          this.reportVital('FCP', metric.value, 1800);
        });
      }

      if (webVitals.getLCP) {
        webVitals.getLCP((metric) => {
          this.vitals.LCP = metric.value;
          this.reportVital('LCP', metric.value, 2500);
        });
      }

      if (webVitals.getTTFB) {
        webVitals.getTTFB((metric) => {
          this.vitals.TTFB = metric.value;
          this.reportVital('TTFB', metric.value, 800);
        });
      }
    } catch (error) {
      console.warn('Web Vitals monitoring failed to initialize:', error);
    }
  }

  private static reportVital(name: string, value: number, threshold: number): void {
    const status = value <= threshold ? '✅' : '⚠️';
    
    if (import.meta.env.DEV) {
      console.log(`${status} ${name}: ${value.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    // Send to analytics in production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }
  }

  static getVitals(): Record<string, number> {
    return { ...this.vitals };
  }
}

// Resource preloading utilities
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  // Preload critical resources
  static preloadCriticalResources(): void {
    // Skip preloading in development to avoid console warnings
    if (import.meta.env.DEV) return;
    
    const criticalResources = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
    ];

    criticalResources.forEach(resource => {
      this.preloadResource(resource, 'image');
    });
  }

  // Preload a specific resource
  static preloadResource(href: string, as: string, crossorigin?: string): void {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    link.onload = () => {
      this.preloadedResources.add(href);
    };

    link.onerror = () => {
      console.warn(`Failed to preload resource: ${href}`);
    };

    document.head.appendChild(link);
  }

  // Prefetch resources for future navigation
  static prefetchResource(href: string): void {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    link.onload = () => {
      this.preloadedResources.add(href);
    };

    document.head.appendChild(link);
  }
}

// Image optimization utilities
export class ImageOptimizer {
  // Create responsive image sources
  static createResponsiveImageSrc(
    baseSrc: string,
    sizes: number[] = [320, 640, 1024, 1280]
  ): string {
    const srcSet = sizes
      .map(size => `${baseSrc}?w=${size}&q=75 ${size}w`)
      .join(', ');
    
    return srcSet;
  }

  // Lazy load images with intersection observer
  static setupLazyLoading(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Memory management utilities
export class MemoryManager {
  private static cleanupTasks: (() => void)[] = [];

  // Register cleanup task
  static registerCleanup(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  // Run all cleanup tasks
  static cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  // Monitor memory usage (development only)
  static monitorMemoryUsage(): void {
    if (import.meta.env.DEV && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576);
      const total = Math.round(memory.totalJSHeapSize / 1048576);
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

      console.log(`Memory usage: ${used}MB / ${total}MB (limit: ${limit}MB)`);

      if (used / limit > 0.8) {
        console.warn('⚠️ High memory usage detected');
      }
    }
  }
}

// Bundle analysis utilities
export class BundleAnalyzer {
  // Analyze chunk loading performance
  static analyzeChunkLoading(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Navigation timing:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  // Report bundle size in development
  static reportBundleSize(): void {
    if (import.meta.env.DEV) {
      // This would be populated by build tools
      console.log('Bundle analysis available in build output');
    }
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Initialize Web Vitals
  WebVitalsMonitor.initializeWebVitals();

  // Preload critical resources
  ResourcePreloader.preloadCriticalResources();

  // Setup lazy loading
  ImageOptimizer.setupLazyLoading();

  // Monitor memory in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      MemoryManager.monitorMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  // Analyze chunk loading
  BundleAnalyzer.analyzeChunkLoading();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    MemoryManager.cleanup();
  });
}