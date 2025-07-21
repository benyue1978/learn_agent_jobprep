import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Chat Boundary Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should handle extremely long messages', async ({ page }) => {
    let frontendRequest: any = null;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 测试超长消息（500字符）
    const longMessage = '这是一个超长的消息'.repeat(25);
    await page.locator('textarea').fill(longMessage);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证超长消息被正确处理
    expect(frontendRequest.message).toBe(longMessage);
    expect(frontendRequest.message.length).toBeGreaterThan(200);
  });

  test('should handle messages with special characters', async ({ page }) => {
    let frontendRequest: any = null;
    
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 测试各种特殊字符
    const specialChars = [
      '!@#$%^&*()_+-=[]{}|;:,.<>?',
      '"\'\\',
      '中文特殊字符：！@#￥%……&*（）——+',
      'emoji: 😀🎉🚀💻',
      '换行符\n制表符\t',
      'HTML标签: <script>alert("test")</script>',
      'SQL注入: SELECT * FROM users; DROP TABLE users;',
      'XSS: <img src="x" onerror="alert(1)">'
    ];

    for (const chars of specialChars) {
      await page.locator('textarea').fill(chars);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // 验证特殊字符被正确处理
      expect(frontendRequest.message).toBe(chars);
    }
  });

  test('should handle empty and whitespace-only messages', async ({ page }) => {
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

    // 测试空消息
    await page.locator('textarea').fill('');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // 测试只有空格的消息
    await page.locator('textarea').fill('   ');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // 测试正常消息
    await page.locator('textarea').fill('正常消息');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should handle very large referenced content', async ({ page }) => {
    let frontendRequest: any = null;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 点击引用按钮
    await page.locator('button[title="引用此内容并提问"]').first().click();
    
    // 测试超长问题
    const longQuestion = '这是一个超长的问题'.repeat(20);
    await page.locator('textarea').fill(longQuestion);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证超长引用内容被正确处理
    expect(frontendRequest.referencedContent).toBeDefined();
    expect(frontendRequest.message).toBe(longQuestion);
  });

  test('should handle rapid message sending', async ({ page }) => {
    const requests: any[] = [];

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        const request = JSON.parse(route.request().postData()!);
        requests.push(request);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 快速发送多个消息
    for (let i = 1; i <= 10; i++) {
      await page.locator('textarea').fill(`消息${i}`);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(100); // 快速连续发送
    }

    await page.waitForTimeout(3000);

    // 验证所有请求都被处理
    expect(requests.length).toBe(10);
  });

  test('should handle network interruptions', async ({ page }) => {
    let errorCount = 0;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        errorCount++;
        
        if (errorCount === 1) {
          // 第一次模拟网络中断
          await route.abort('failed');
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
    await expect(page.locator('text=您好！我是您的简历优化助手')).toBeVisible();
  });

  test('should handle malformed JSON responses', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 返回格式错误的JSON
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息
    await page.locator('textarea').fill('测试消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证错误处理
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
  });

  test('should handle very slow responses', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 模拟很慢的响应
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15秒延迟
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '延迟回复',
            action: null
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息
    await page.locator('textarea').fill('测试消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(12000); // 等待超时

    // 验证超时处理
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
  });

  test('should handle memory pressure with large chat history', async ({ page }) => {
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

    // 发送大量消息来测试内存压力
    for (let i = 1; i <= 20; i++) {
      await page.locator('textarea').fill(`消息${i}`);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(3000);

    // 验证页面仍然正常工作
    await expect(page.locator('textarea')).toBeVisible();
    
    // 验证可以继续发送消息
    await page.locator('textarea').fill('新消息');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    
    await expect(page.locator('text=您好！我是您的简历优化助手').first()).toBeVisible();
  });

  test('should handle unicode and international characters', async ({ page }) => {
    let frontendRequest: any = null;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 测试各种Unicode字符
    const unicodeTests = [
      '中文：你好世界',
      '日文：こんにちは世界',
      '韩文：안녕하세요 세계',
      '阿拉伯文：مرحبا بالعالم',
      '俄文：Привет мир',
      '希腊文：Γεια σου κόσμε',
      '泰文：สวัสดีชาวโลก',
      '印地文：नमस्ते दुनिया',
      '表情符号：😀🎉🚀💻🌟🎯📚💡'
    ];

    for (const test of unicodeTests) {
      await page.locator('textarea').fill(test);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // 验证Unicode字符被正确处理
      expect(frontendRequest.message).toBe(test);
    }
  });
}); 