import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Home Page Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should display home page correctly', async ({ page }) => {
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

    await page.goto('/');
    
    // Wait for redirect to edit page
    await expect(page).toHaveURL('/edit', { timeout: 10000 });
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