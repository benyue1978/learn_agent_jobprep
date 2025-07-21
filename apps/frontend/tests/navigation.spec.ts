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
    // Mock the API response to simulate existing resume
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com',
              phone: '13800138000',
              location: '北京',
              summary: '经验丰富的软件工程师'
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    await page.click('a[href="/edit"]');
    await expect(page).toHaveURL('/edit');
    
    // Wait for the page to load and check for any visible content
    await page.waitForTimeout(2000);
    
    // Check if any heading is visible (could be h1, h2, or h3 depending on state)
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Verify we're on the edit page by checking URL and some content
    await expect(page).toHaveURL('/edit');
  });

  test('should navigate to test page', async ({ page }) => {
    await page.click('a[href="/test"]');
    await expect(page).toHaveURL('/test');
    await expect(page.locator('h1')).toContainText('Backend API Test');
  });

  test('should navigate back to home page', async ({ page }) => {
    // Mock the API response to simulate no resume for home page redirect
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Resume not found' })
      });
    });

    await page.click('a[href="/upload"]');
    await expect(page).toHaveURL('/upload');
    
    await page.click('a[href="/"]');
    // Home page will redirect to upload page when no resume exists
    await expect(page).toHaveURL('/upload', { timeout: 10000 });
  });
}); 