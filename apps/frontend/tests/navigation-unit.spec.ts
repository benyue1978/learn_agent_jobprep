import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Navigation Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // 导航到首页
    await page.goto('/');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // Check if navigation bar is visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Check if logo/brand is visible
    await expect(page.locator('a[href="/"]').first()).toContainText('求职助手');
    
    // Check if navigation links are present
    await expect(page.locator('a[href="/upload"]')).toContainText('上传简历');
    await expect(page.locator('a[href="/edit"]')).toContainText('编辑简历');
    await expect(page.locator('a[href="/test"]')).toContainText('测试页面');
  });

  test('should navigate to upload page', async ({ page }) => {
    // 导航到首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 点击上传简历链接
    await page.click('a[href="/upload"]');
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('开始完善你的求职档案');
  });

  test('should navigate to edit page', async ({ page }) => {
    // 导航到首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 点击编辑简历链接
    await page.click('a[href="/edit"]');
    await expect(page).toHaveURL('/edit');
    
    // Wait for the page to load and check for any visible content
    await page.waitForLoadState('networkidle');
    
    // Check if the page has loaded some content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should navigate to test page', async ({ page }) => {
    // 导航到首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 点击测试页面链接
    await page.click('a[href="/test"]');
    await expect(page).toHaveURL('/test');
    await expect(page.locator('h1')).toContainText('Backend API Test');
  });

  test('should navigate back to home page', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // 点击首页链接
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
    
    // 验证首页内容
    await expect(page.locator('body')).toContainText('求职助手');
  });
}); 