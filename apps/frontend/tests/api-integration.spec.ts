import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('should validate complete API call chain', async ({ page }) => {
    let frontendRequest: any = null;

    // 只监听前端API路由
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        console.log('前端请求:', frontendRequest);
        await route.continue(); // 让请求继续到后端
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

    // 验证前端发送的格式
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('测试消息');
    expect(frontendRequest.referencedContent).toBeUndefined();
    
    // 验证响应显示
    await expect(page.locator('text=您好！我是您的简历优化助手')).toBeVisible();
  });

  test('should validate API format conversion for referenced content', async ({ page }) => {
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
    await page.locator('textarea').fill('请帮我优化');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证引用内容的格式转换
    expect(frontendRequest.referencedContent).toBeDefined();
    expect(frontendRequest.message).toBe('请帮我优化');
    
    // 验证响应显示
    await expect(page.locator('text=您好！我是您的简历优化助手')).toBeVisible();
  });

  test('should handle API errors and retries', async ({ page }) => {
    let errorCount = 0;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        errorCount++;
        
        if (errorCount === 1) {
          // 第一次返回错误
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' })
          });
        } else {
          // 第二次让请求继续
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
    expect(errorCount).toBe(2);
  });

  test('should validate API response format', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 返回包含建议的响应格式
        const backendResponse = {
          reply: '这是一个详细的回复',
          suggestion: {
            field: 'basics.summary',
            current: '当前内容',
            suggested: '建议内容',
            reason: '建议原因'
          }
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(backendResponse)
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息
    await page.locator('textarea').fill('请给我建议');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证响应格式
    await expect(page.locator('text=这是一个详细的回复')).toBeVisible();
    await expect(page.locator('button:has-text("接受")').first()).toBeVisible();
    await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();
  });

  test('should handle malformed API responses', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 返回格式错误的响应
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

  test('should validate API timeout handling', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 模拟超时 - 不调用任何方法
        // 让请求超时
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

  test('should handle concurrent API requests', async ({ page }) => {
    const requests: any[] = [];

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        const request = JSON.parse(route.request().postData()!);
        requests.push(request);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: `回复${requests.length}`,
            action: null
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 快速发送多个消息
    await page.locator('textarea').fill('消息1');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    await page.locator('textarea').fill('消息2');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    await page.locator('textarea').fill('消息3');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // 验证所有请求都被正确处理
    expect(requests.length).toBe(3);
    expect(requests[0].message).toBe('消息1');
    expect(requests[1].message).toBe('消息2');
    expect(requests[2].message).toBe('消息3');
  });

  test('should validate API request headers', async ({ page }) => {
    let requestHeaders: any = null;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        requestHeaders = route.request().headers();
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '测试回复',
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
    await page.waitForTimeout(3000);

    // 验证请求头
    expect(requestHeaders).toBeDefined();
    expect(requestHeaders['content-type']).toBe('application/json');
    expect(requestHeaders['accept']).toContain('application/json');
  });

  test('should handle API rate limiting', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        requestCount++;
        
        if (requestCount <= 3) {
          // 前3个请求成功
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              reply: `回复${requestCount}`,
              action: null
            })
          });
        } else {
          // 第4个请求被限流
          await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Rate limit exceeded'
            })
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送4个消息
    for (let i = 1; i <= 4; i++) {
      await page.locator('textarea').fill(`消息${i}`);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
    }

    // 验证前3个请求成功，第4个失败
    await expect(page.locator('text=回复1')).toBeVisible();
    await expect(page.locator('text=回复2')).toBeVisible();
    await expect(page.locator('text=回复3')).toBeVisible();
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
  });
}); 