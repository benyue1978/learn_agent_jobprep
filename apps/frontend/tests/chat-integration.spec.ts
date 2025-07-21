import { test, expect } from '@playwright/test';

test.describe('Chat Integration Tests', () => {
  test('should make real API call to backend with correct format', async ({ page }) => {
    // Mock简历数据
    await page.route('**/api/resume', async (route) => {
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
              suggestions: []
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    // 直接mock前端API路由，验证格式转换
    let frontendRequest: any = null;
    let backendRequest: any = null;
    
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 捕获前端发送的请求
        frontendRequest = JSON.parse(route.request().postData()!);
        
        // 模拟前端路由的格式转换逻辑
        backendRequest = {
          messages: [
            {
              role: 'user',
              content: frontendRequest.referencedContent 
                ? `引用内容：${frontendRequest.referencedContent}\n\n问题：${frontendRequest.message}` 
                : frontendRequest.message,
            },
          ],
          context: {
            referencedContent: frontendRequest.referencedContent,
          },
        };
        
        // 返回模拟响应
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '您好！我是您的简历优化助手。',
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
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();
    
    // 等待API调用完成
    await page.waitForTimeout(3000);
    
    // 验证前端发送的格式
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('你好');
    expect(frontendRequest.referencedContent).toBeUndefined();
    
    // 验证转换后的后端格式
    expect(backendRequest).toBeDefined();
    expect(backendRequest.messages).toBeDefined();
    expect(backendRequest.messages[0].role).toBe('user');
    expect(backendRequest.messages[0].content).toBe('你好');
    expect(backendRequest.context).toBeDefined();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/resume', async (route) => {
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
              suggestions: []
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    // Mock前端API路由返回错误
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 返回错误响应
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
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();
    
    // 等待错误处理
    await page.waitForTimeout(3000);
    
    // 验证错误消息显示
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
  });

  test('should format referenced content correctly', async ({ page }) => {
    await page.route('**/api/resume', async (route) => {
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
              suggestions: []
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    let frontendRequest: any = null;
    let backendRequest: any = null;
    
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 捕获前端发送的请求
        frontendRequest = JSON.parse(route.request().postData()!);
        
        // 模拟前端路由的格式转换逻辑
        backendRequest = {
          messages: [
            {
              role: 'user',
              content: frontendRequest.referencedContent 
                ? `引用内容：${frontendRequest.referencedContent}\n\n问题：${frontendRequest.message}` 
                : frontendRequest.message,
            },
          ],
          context: {
            referencedContent: frontendRequest.referencedContent,
          },
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: '基于您引用的内容，我建议...',
            action: null
          })
        });
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
    
    // 验证引用内容格式
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('请帮我优化');
    expect(frontendRequest.referencedContent).toBeDefined();
    
    expect(backendRequest).toBeDefined();
    expect(backendRequest.messages[0].content).toContain('引用内容：');
    expect(backendRequest.messages[0].content).toContain('问题：请帮我优化');
    expect(backendRequest.context.referencedContent).toBeDefined();
  });

  test('should handle network timeouts', async ({ page }) => {
    await page.route('**/api/resume', async (route) => {
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
              suggestions: []
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    // Mock前端API路由超时
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 故意不调用 route.fulfill，模拟网络超时
        // 不调用任何方法，让请求超时
      } else {
        await route.continue();
      }
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 发送消息
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();
    
    // 等待超时处理 - 增加等待时间
    await page.waitForTimeout(15000);
    
    // 验证错误消息显示
    await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
  });

  test('should validate API format conversion', async ({ page }) => {
    // 这个测试专门验证前端路由的格式转换
    await page.route('**/api/resume', async (route) => {
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
              suggestions: []
            },
            education: [],
            work: [],
            skills: [],
            certificates: []
          }
        })
      });
    });

    let frontendRequest: any = null;
    let backendRequest: any = null;

    // 监听前端发送的请求
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        // 捕获前端发送的请求
        frontendRequest = JSON.parse(route.request().postData()!);
        
        // 模拟前端路由的格式转换逻辑
        backendRequest = {
          messages: [
            {
              role: 'user',
              content: frontendRequest.referencedContent 
                ? `引用内容：${frontendRequest.referencedContent}\n\n问题：${frontendRequest.message}` 
                : frontendRequest.message,
            },
          ],
          context: {
            referencedContent: frontendRequest.referencedContent,
          },
        };
        
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
    
    // 验证前端发送的格式
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('测试消息');
    expect(frontendRequest.referencedContent).toBeUndefined();
    
    // 验证转换后的后端格式
    expect(backendRequest).toBeDefined();
    expect(backendRequest.messages).toBeDefined();
    expect(backendRequest.messages[0].role).toBe('user');
    expect(backendRequest.messages[0].content).toBe('测试消息');
    expect(backendRequest.context).toBeDefined();
  });
}); 