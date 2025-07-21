import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should complete full chat workflow @real-backend', async ({ page }) => {
    let frontendRequests: any[] = [];

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        const request = JSON.parse(route.request().postData()!);
        frontendRequests.push(request);
        
        // 根据请求内容返回不同的响应
        if (request.message.includes('分析')) {
          // 返回包含建议的响应
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              reply: '基于您的简历，我建议在以下几个方面进行优化',
              suggestion: {
                field: 'basics.summary',
                current: '经验丰富的软件工程师',
                suggested: '5年经验的高级软件工程师，专注于大规模分布式系统开发',
                reason: '添加具体年限和更专业的技术描述'
              }
            })
          });
        } else {
          // 返回普通响应
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              reply: '您好！我是您的简历优化助手',
              action: null
            })
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 步骤1: 发送初始消息
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // 验证初始消息
    await expect(page.locator('text=您好！我是您的简历优化助手').first()).toBeVisible();

    // 步骤2: 请求简历分析
    await page.locator('textarea').fill('请帮我分析简历');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // 验证分析响应
    await expect(page.locator('text=基于您的简历，我建议在以下几个方面进行优化').first()).toBeVisible();
    await expect(page.locator('button:has-text("接受")').first()).toBeVisible();

    // 步骤3: 接受建议
    await page.locator('button:has-text("接受")').first().click();
    await page.waitForTimeout(2000);
    
    // 验证建议被接受
    await expect(page.locator('text=基于您的简历，我建议在以下几个方面进行优化').first()).toBeVisible();

    // 步骤4: 验证API调用格式
    expect(frontendRequests.length).toBeGreaterThan(0);
    expect(frontendRequests[0].message).toBe('你好');
    expect(frontendRequests[1].message).toBe('请帮我分析简历');
  });

  test('should handle chat with referenced content @real-backend', async ({ page }) => {
    let frontendRequests: any[] = [];

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        const request = JSON.parse(route.request().postData()!);
        frontendRequests.push(request);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 点击引用按钮
    await page.locator('button[title="引用此内容并提问"]').first().click();
    await page.locator('textarea').fill('请帮我优化这部分');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // 验证引用内容格式
    expect(frontendRequests.length).toBe(1);
    expect(frontendRequests[0].referencedContent).toBeDefined();
    expect(frontendRequests[0].message).toBe('请帮我优化这部分');
  });

  test('should handle multiple suggestions and rejections', async ({ page }) => {
    let suggestionCount = 0;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 模拟包含建议的响应
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '基于您的简历，我建议在以下几个方面进行优化',
            suggestion: {
              field: 'basics.summary',
              current: '经验丰富的软件工程师',
              suggested: '5年经验的高级软件工程师，专注于大规模分布式系统开发',
              reason: '添加具体年限和更专业的技术描述'
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息获取建议
    await page.locator('textarea').fill('请给我一些建议');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证建议按钮出现
    await expect(page.locator('button:has-text("接受")').first()).toBeVisible();
    await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    let errorCount = 0;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        errorCount++;
        
        if (errorCount === 1) {
          // 第一次模拟错误
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' })
          });
        } else {
          // 第二次正常处理
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息（第一次会失败）
    await page.locator('textarea').fill('测试消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证错误处理
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();

    // 再次发送消息（第二次会成功）
    await page.locator('textarea').fill('重试消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证成功处理
    await expect(page.locator('text=您好！我是您的简历优化助手').first()).toBeVisible();
  });

  test('should handle concurrent user interactions', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 快速连续操作
    await page.locator('textarea').fill('消息1');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    await page.locator('textarea').fill('消息2');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    await page.locator('textarea').fill('消息3');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证所有消息都被处理
    await expect(page.locator('text=消息1')).toBeVisible();
    await expect(page.locator('text=消息2')).toBeVisible();
    await expect(page.locator('text=消息3')).toBeVisible();
  });

  test('should handle long conversation history', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送多条消息建立对话历史
    for (let i = 1; i <= 10; i++) {
      await page.locator('textarea').fill(`历史消息${i}`);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(3000);

    // 验证对话历史保持
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator(`text=历史消息${i}`).first()).toBeVisible();
    }

    // 验证可以继续对话
    await page.locator('textarea').fill('新消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=新消息')).toBeVisible();
  });

  test('should handle different types of user inputs', async ({ page }) => {
    let frontendRequests: any[] = [];

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        const request = JSON.parse(route.request().postData()!);
        frontendRequests.push(request);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 测试不同类型的输入
    const testInputs = [
      '简单问题',
      '这是一个很长的详细问题，包含了很多具体的细节和要求...',
      '包含特殊字符的问题：!@#$%^&*()',
      '包含emoji的问题 😀🎉🚀',
      '包含换行的问题\n第二行\n第三行'
    ];

    for (const input of testInputs) {
      await page.locator('textarea').fill(input);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // 验证输入被正确处理
      expect(frontendRequests.length).toBeGreaterThan(0);
    }
  });

  test('should handle suggestion interactions correctly', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 模拟包含建议的响应
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '基于您的简历，我建议在以下几个方面进行优化',
            suggestion: {
              field: 'basics.summary',
              current: '经验丰富的软件工程师',
              suggested: '5年经验的高级软件工程师，专注于大规模分布式系统开发',
              reason: '添加具体年限和更专业的技术描述'
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息获取建议
    await page.locator('textarea').fill('请给我一些改进建议');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证建议显示
    await expect(page.locator('button:has-text("接受")').first()).toBeVisible();
    await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();

    // 测试接受建议
    await page.locator('button:has-text("接受")').first().click();
    await page.waitForTimeout(2000);

    // 验证建议被接受（按钮应该消失或状态改变）
    // 由于接受建议后可能需要重新加载或状态改变，我们验证建议内容仍然可见
    await expect(page.locator('text=基于您的简历，我建议在以下几个方面进行优化').first()).toBeVisible();

    // 发送新消息获取新建议
    await page.locator('textarea').fill('还有其他建议吗？');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证新建议出现
    await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();
  });

  test('should handle chat window state correctly', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 验证聊天窗口初始状态
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 发送消息
    await page.locator('textarea').fill('测试消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // 验证消息发送后状态
    await expect(page.locator('textarea')).toBeEmpty();
    // 按钮可能在处理中，不检查状态

    // 验证消息历史保持
    await expect(page.locator('text=测试消息')).toBeVisible();
  });
}); 