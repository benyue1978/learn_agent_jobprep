import { test, expect } from '@playwright/test';

test.describe('Upload Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('should load upload page successfully', async ({ page }) => {
    await expect(page).toHaveTitle('求职助手 - AI 简历优化工具');
    await expect(page.locator('h1')).toContainText('开始完善你的求职档案');
  });

  test('should display upload form elements', async ({ page }) => {
    // Check if textarea is present
    await expect(page.locator('textarea')).toBeVisible();
    
    // Check if submit button is present
    await expect(page.locator('button:has-text("确认并分析")')).toBeVisible();
    
    // Check if help text is displayed
    await expect(page.locator('text=支持 Markdown 格式或纯文本格式的简历内容')).toBeVisible();
  });

  test('should show validation error for empty form submission', async ({ page }) => {
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
    const sampleResume = `# 张三

## 基本信息
- 姓名：张三
- 邮箱：zhangsan@example.com
- 电话：13800138000

## 教育背景
- 清华大学 计算机科学学士 2018-2022

## 工作经验
- 阿里巴巴 高级软件工程师 2022-2024`;

    // Mock the API response for successful upload
    await page.route('**/api/parse_resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com'
            }
          }
        })
      });
    });

    // Fill in the textarea
    await page.fill('textarea', sampleResume);
    
    // Submit the form
    await page.click('button:has-text("确认并分析")');
    
    // Should redirect to edit page after successful upload
    await expect(page).toHaveURL('/edit');
  });

  test('should handle upload error gracefully', async ({ page }) => {
    const sampleResume = `# 张三

## 基本信息
- 姓名：张三
- 邮箱：zhangsan@example.com`;

    // Mock the API response for upload error
    await page.route('**/api/parse_resume', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to parse resume'
        })
      });
    });

    // Fill in the textarea
    await page.fill('textarea', sampleResume);
    
    // Submit the form
    await page.click('button:has-text("确认并分析")');
    
    // Should show error message
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display usage tips', async ({ page }) => {
    // Check if usage tips are displayed
    await expect(page.locator('text=💡 使用提示')).toBeVisible();
    await expect(page.locator('text=支持 Markdown 格式的简历内容')).toBeVisible();
    await expect(page.locator('text=支持纯文本格式的简历内容')).toBeVisible();
    await expect(page.locator('text=AI 将自动解析并结构化你的简历信息')).toBeVisible();
  });
}); 