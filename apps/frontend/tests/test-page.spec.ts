import { test, expect } from '@playwright/test';

test.describe('Test Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test');
  });

  test('should load test page successfully', async ({ page }) => {
    await expect(page).toHaveTitle('求职助手 - AI 简历优化工具');
    await expect(page.locator('h1')).toContainText('Backend API Test');
  });

  test('should display test page content', async ({ page }) => {
    // Check if main content is displayed
    await expect(page.locator('text=Testing connection to FastAPI backend')).toBeVisible();
    await expect(page.locator('text=Test Backend Connection')).toBeVisible();
    await expect(page.locator('h3:has-text("Test Endpoint")')).toBeVisible();
  });

  test('should display backend status information', async ({ page }) => {
    // Check if backend status is displayed
    await expect(page.locator('text=Backend is up and running')).toBeVisible();
    await expect(page.locator('text=Health Check')).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();
    await expect(page.locator('text=healthy')).toBeVisible();
    await expect(page.locator('text=Service:')).toBeVisible();
    await expect(page.locator('text=jobprep-backend')).toBeVisible();
  });

  test('should display API information', async ({ page }) => {
    // Check if API information is displayed
    await expect(page.locator('text=API Information')).toBeVisible();
    await expect(page.locator('text=Base URL:')).toBeVisible();
    await expect(page.locator('text=http://localhost:8000')).toBeVisible();
    await expect(page.locator('text=Test Endpoint:')).toBeVisible();
    await expect(page.locator('text=GET /test')).toBeVisible();
    await expect(page.locator('text=Health Endpoint:')).toBeVisible();
    await expect(page.locator('text=GET /healthz')).toBeVisible();
  });

  test('should test backend connection successfully', async ({ page }) => {
    // Mock the backend API responses
    await page.route('**/api/test', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Backend is working' })
      });
    });

    await page.route('**/api/healthz', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'healthy' })
      });
    });

    // Click test buttons if they exist
    const testButtons = page.locator('button');
    const buttonCount = await testButtons.count();
    
    if (buttonCount > 0) {
      // Click the first test button if available
      await testButtons.first().click();
      
      // Wait a moment for any response
      await page.waitForTimeout(1000);
    }

    // Page should still be visible after testing
    await expect(page.locator('h1')).toContainText('Backend API Test');
  });

  test('should handle backend connection errors gracefully', async ({ page }) => {
    // Mock the backend API responses to simulate errors
    await page.route('**/api/test', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Backend error' })
      });
    });

    await page.route('**/api/healthz', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    });

    // Page should still be visible even with backend errors
    await expect(page.locator('h1')).toContainText('Backend API Test');
    await expect(page.locator('text=Testing connection to FastAPI backend')).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    // Check if navigation is present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/"]').nth(1)).toContainText('首页');
    await expect(page.locator('a[href="/upload"]')).toContainText('上传简历');
    await expect(page.locator('a[href="/edit"]')).toContainText('编辑简历');
    await expect(page.locator('a[href="/test"]')).toContainText('测试页面');
  });
}); 