import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display navigation bar with all links', async ({ page }) => {
    // Check if navigation bar is visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Check if logo/brand is visible
    await expect(page.locator('a[href="/"]').first()).toContainText('求职助手');
    
    // Check if all navigation links are present
    await expect(page.locator('a[href="/"]').nth(1)).toContainText('首页');
    await expect(page.locator('a[href="/upload"]')).toContainText('上传简历');
    await expect(page.locator('a[href="/edit"]')).toContainText('编辑简历');
    await expect(page.locator('a[href="/test"]')).toContainText('测试页面');
  });

  test('should navigate to upload page', async ({ page }) => {
    await page.click('a[href="/upload"]');
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('开始完善你的求职档案');
  });

  test('should navigate to edit page', async ({ page }) => {
    await page.click('a[href="/edit"]');
    await expect(page).toHaveURL('/edit');
    await expect(page.locator('h1')).toContainText('简历编辑');
  });

  test('should navigate to test page', async ({ page }) => {
    await page.click('a[href="/test"]');
    await expect(page).toHaveURL('/test');
    await expect(page.locator('h1')).toContainText('Backend API Test');
  });

  test('should navigate back to home page', async ({ page }) => {
    await page.click('a[href="/upload"]');
    await expect(page).toHaveURL('/upload');
    
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
}); 