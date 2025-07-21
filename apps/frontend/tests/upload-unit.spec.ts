import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Upload Page Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should display upload page correctly', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle('求职助手 - AI 简历优化工具');
    await expect(page.locator('h1')).toContainText('开始完善你的求职档案');
  });

  test('should display upload form elements', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Check if textarea is present
    await expect(page.locator('textarea')).toBeVisible();
    
    // Check if submit button is present
    await expect(page.locator('button:has-text("确认并分析")')).toBeVisible();
    
    // Check if label is present
    await expect(page.locator('label[for="resume-text"]')).toContainText('简历内容');
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Check if submit button is disabled when form is empty
    const submitButton = page.locator('button:has-text("确认并分析")');
    await expect(submitButton).toBeDisabled();
    
    // Try to fill some content and then clear it to test validation
    await page.fill('textarea', 'test content');
    await expect(submitButton).toBeEnabled();
    
    await page.fill('textarea', '');
    await expect(submitButton).toBeDisabled();
  });

  test('should handle resume upload successfully', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Mock successful API response
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

    const sampleResume = `
姓名：张三
邮箱：zhangsan@example.com
电话：13800138000
地址：北京市朝阳区

工作经验：
- 软件工程师，ABC公司，2020-2023
- 负责开发Web应用程序
- 使用React和Node.js技术栈

教育背景：
- 计算机科学学士，XYZ大学，2016-2020

技能：
- JavaScript, TypeScript
- React, Node.js
- Python, Java
    `;

    // Fill in the textarea
    await page.fill('textarea', sampleResume);
    
    // Submit the form
    await page.click('button:has-text("确认并分析")');
    
    // Wait for navigation to edit page
    await expect(page).toHaveURL('/edit');
  });

  test('should handle upload error gracefully', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Mock error API response for parse_resume endpoint
    await page.route('**/api/parse_resume', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '解析简历时发生错误'
        })
      });
    });

    const sampleResume = `
姓名：张三
邮箱：zhangsan@example.com
电话：13800138000
地址：北京市朝阳区

工作经验：
- 软件工程师，ABC公司，2020-2023
- 负责开发Web应用程序
- 使用React和Node.js技术栈

教育背景：
- 计算机科学学士，XYZ大学，2016-2020

技能：
- JavaScript, TypeScript
- React, Node.js
- Python, Java
    `;

    // Fill in the textarea
    await page.fill('textarea', sampleResume);
    
    // Submit the form
    await page.click('button:has-text("确认并分析")');
    
    // Wait for error message to appear - check for any error message
    await expect(page.locator('.bg-red-50, .bg-red-900\\/20')).toBeVisible();
    await expect(page.locator('text=错误')).toBeVisible();
    
    // Verify we're still on the upload page
    await expect(page).toHaveURL('/upload');
  });

  test('should display usage tips', async ({ page }) => {
    // 导航到上传页面
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Check if usage tips are displayed
    await expect(page.locator('text=💡 使用提示')).toBeVisible();
    await expect(page.locator('text=支持 Markdown 格式的简历内容')).toBeVisible();
    await expect(page.locator('text=支持纯文本格式的简历内容')).toBeVisible();
    await expect(page.locator('text=AI 将自动解析并结构化你的简历信息')).toBeVisible();
  });
}); 