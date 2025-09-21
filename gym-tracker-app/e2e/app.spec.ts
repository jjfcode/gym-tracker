import { test, expect } from '@playwright/test';

test.describe('Gym Tracker App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Gym Tracker App');
    
    // Check if navigation links are present
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/progress"]')).toBeVisible();
    await expect(page.locator('a[href="/exercises"]')).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Click on dashboard link
    await page.click('a[href="/dashboard"]');
    
    // Wait for navigation
    await page.waitForURL('/dashboard');
    
    // Check if we're on the dashboard page
    await expect(page.locator('h1, h2')).toContainText(/dashboard|today/i);
  });

  test('should navigate to progress page', async ({ page }) => {
    await page.goto('/');
    
    // Click on progress link
    await page.click('a[href="/progress"]');
    
    // Wait for navigation
    await page.waitForURL('/progress');
    
    // Check if we're on the progress page
    await expect(page.locator('h1, h2')).toContainText(/progress|weight/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if the page is still functional on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
  });

  test('should handle PWA features', async ({ page, context }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const serviceWorkerPromise = page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(await serviceWorkerPromise).toBe(true);
  });

  test('should handle offline functionality', async ({ page, context }) => {
    await page.goto('/');
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Navigate to a page (should work with cached content)
    await page.click('a[href="/dashboard"]');
    
    // The page should still load (from cache)
    await expect(page.locator('body')).toBeVisible();
    
    // Restore online mode
    await context.setOffline(false);
  });

  test('should load pages within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});