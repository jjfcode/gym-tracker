import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/');
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};
          
          entries.forEach((entry: any) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + entry.value;
            }
          });
          
          // Resolve after a short delay to collect metrics
          setTimeout(() => resolve(metrics), 2000);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    // LCP should be under 2.5 seconds
    if ((metrics as any).lcp) {
      expect((metrics as any).lcp).toBeLessThan(2500);
    }
    
    // FID should be under 100ms
    if ((metrics as any).fid) {
      expect((metrics as any).fid).toBeLessThan(100);
    }
    
    // CLS should be under 0.1
    if ((metrics as any).cls) {
      expect((metrics as any).cls).toBeLessThan(0.1);
    }
  });

  test('should load critical resources quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for first contentful paint
    await page.waitForFunction(() => {
      const entries = performance.getEntriesByType('paint');
      return entries.some(entry => entry.name === 'first-contentful-paint');
    });
    
    const fcpTime = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : 0;
    });
    
    // FCP should be under 1.8 seconds
    expect(fcpTime).toBeLessThan(1800);
  });

  test('should have efficient bundle sizes', async ({ page }) => {
    await page.goto('/');
    
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js'))
        .map(resource => ({
          name: resource.name.split('/').pop(),
          size: resource.transferSize,
        }));
    });
    
    // Main bundle should be under 500KB
    const mainBundle = resourceSizes.find(resource => 
      resource.name?.includes('index') || resource.name?.includes('main')
    );
    
    if (mainBundle) {
      expect(mainBundle.size).toBeLessThan(500 * 1024); // 500KB
    }
  });

  test('should handle concurrent users efficiently', async ({ page, context }) => {
    // Simulate multiple concurrent requests
    const promises = Array.from({ length: 5 }, async (_, i) => {
      const newPage = await context.newPage();
      const startTime = Date.now();
      await newPage.goto('/');
      await newPage.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      await newPage.close();
      return loadTime;
    });
    
    const loadTimes = await Promise.all(promises);
    
    // All pages should load within reasonable time even with concurrent requests
    loadTimes.forEach(loadTime => {
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });
    
    // Average load time should be reasonable
    const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    expect(averageLoadTime).toBeLessThan(3000); // 3 seconds average
  });
});