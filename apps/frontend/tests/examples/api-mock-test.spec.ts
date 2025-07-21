import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from '../mocks/api-mocks';
import { createTestResume, createTestChatResponse } from '../fixtures/resume-data';

test.describe('API Mock Test', () => {
  test('should load resume data with API mock', async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());

    // 导航到编辑页面
    await page.goto('/edit');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 验证简历数据是否正确显示
    await expect(page.locator('text=张三')).toBeVisible();
    await expect(page.locator('text=zhangsan@example.com')).toBeVisible();
    await expect(page.locator('text=经验丰富的软件工程师')).toBeVisible();

    // 验证聊天窗口是否显示
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should handle chat with API mock', async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());

    // 导航到编辑页面
    await page.goto('/edit');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 发送消息
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();

    // 验证响应
    await expect(page.locator('text=您好！我是您的简历优化助手。')).toBeVisible();
  });

  test('should handle chat with suggestion', async ({ page }) => {
    // 设置API模拟，包含建议
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, {
      reply: '基于您的简历，我建议在以下几个方面进行优化',
      suggestion: {
        field: 'basics.summary',
        current: '经验丰富的软件工程师',
        suggested: '5年经验的高级软件工程师，专注于大规模分布式系统开发',
        reason: '添加具体年限和更专业的技术描述'
      },
      action: {
        type: 'suggest_update',
        field: 'basics.summary',
        suggested: '5年经验的高级软件工程师，专注于大规模分布式系统开发'
      }
    });

    // 导航到编辑页面
    await page.goto('/edit');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 发送消息
    await page.locator('textarea').fill('请给我一些建议');
    await page.locator('button[type="submit"]').click();

    // 验证建议是否显示
    await expect(page.locator('text=基于您的简历，我建议在以下几个方面进行优化')).toBeVisible();
    await expect(page.locator('text=接受')).toBeVisible();
    await expect(page.locator('text=拒绝')).toBeVisible();
  });
}); 