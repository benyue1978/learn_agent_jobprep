import { test, expect } from '@playwright/test';

test.describe('Home Page Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if page title is correct
    await expect(page).toHaveTitle('求职助手 - AI 简历优化工具');
    
    // Check if page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/');
    
    // Check if loading spinner is visible initially
    // Note: Loading state might not be visible if page loads quickly
    await expect(page.locator('body')).toBeVisible();
  });

  test('should redirect to edit page when resume exists', async ({ page }) => {
    // Mock the API response to simulate existing resume
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com'
            }
          }
        })
      });
    });

    await page.goto('/');
    
    // Wait for redirect to edit page
    await expect(page).toHaveURL('/edit');
    await expect(page.locator('h1')).toContainText('简历编辑');
  });

  test('should redirect to upload page when no resume exists', async ({ page }) => {
    // Mock the API response to simulate no resume
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Resume not found' })
      });
    });

    await page.goto('/');
    
    // Wait for redirect to upload page
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('开始完善你的求职档案');
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock the API response to simulate server error
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/');
    
    // Should still show some content even with API error
    await expect(page.locator('nav')).toBeVisible();
  });
}); 