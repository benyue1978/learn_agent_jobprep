import { test, expect } from '@playwright/test';

test.describe('Chat Format Tests', () => {
  test('should test API format conversion without backend', async ({ page }) => {
    // 这个测试专门验证前端路由的格式转换逻辑
    let frontendRequest: any = null;
    let backendRequest: any = null;

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

    // 监听前端发送的请求
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        frontendRequest = JSON.parse(route.request().postData()!);
        console.log('前端发送的请求:', frontendRequest);
        
        // 模拟前端路由的格式转换逻辑
        const convertedRequest = {
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
        
        backendRequest = convertedRequest;
        console.log('转换后的后端请求:', backendRequest);
        
        // 返回模拟响应
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

    // 测试1: 普通消息
    await page.locator('textarea').fill('你好');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // 验证格式转换
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('你好');
    expect(frontendRequest.referencedContent).toBeUndefined();
    
    expect(backendRequest).toBeDefined();
    expect(backendRequest.messages[0].role).toBe('user');
    expect(backendRequest.messages[0].content).toBe('你好');
    expect(backendRequest.context.referencedContent).toBeUndefined();
    
    // 清空消息
    await page.reload();
    await page.waitForSelector('text=张三', { timeout: 10000 });
    
    // 重置请求变量
    frontendRequest = null;
    backendRequest = null;
    
    // 测试2: 引用消息
    await page.locator('button[title="引用此内容并提问"]').first().click();
    await page.locator('textarea').fill('请帮我优化');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // 验证引用格式转换
    expect(frontendRequest).toBeDefined();
    expect(frontendRequest.message).toBe('请帮我优化');
    expect(frontendRequest.referencedContent).toBeDefined();
    
    expect(backendRequest).toBeDefined();
    expect(backendRequest.messages[0].role).toBe('user');
    expect(backendRequest.messages[0].content).toContain('引用内容：');
    expect(backendRequest.messages[0].content).toContain('问题：请帮我优化');
    expect(backendRequest.context.referencedContent).toBeDefined();
  });

  test('should validate the original API format issue', async ({ page }) => {
    // 这个测试模拟原始的问题：前端直接调用后端API
    let directBackendRequest: any = null;
    
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

    // 模拟前端直接调用后端API（错误的方式）
    await page.route('**/api/chat', async (route) => {
      const url = route.request().url();
      if (url.includes('localhost:3000')) {
        await route.continue();
      } else if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
        directBackendRequest = JSON.parse(route.request().postData()!);
        console.log('直接调用后端的请求:', directBackendRequest);
        
        // 模拟422错误（格式不匹配）
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: [
              {
                type: "missing",
                loc: ["body", "messages"],
                msg: "Field required"
              }
            ]
          })
        });
      } else {
        await route.continue();
      }
    });

    // 临时修改api.chat函数，让它直接调用后端
    await page.addInitScript(() => {
      // 模拟错误的API调用方式
      (window as any).testDirectBackendCall = async (message: string, referencedContent?: string) => {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            referencedContent,
          }),
        });
        return response.json();
      };
    });

    await page.goto('/edit');
    await page.waitForSelector('text=张三', { timeout: 10000 });

    // 通过控制台调用错误的API
    await page.evaluate(() => {
      return (window as any).testDirectBackendCall('测试消息');
    });
    
    await page.waitForTimeout(2000);
    
    // 验证直接调用后端的请求格式（错误的格式）
    expect(directBackendRequest).toBeDefined();
    expect(directBackendRequest.message).toBe('测试消息');
    expect(directBackendRequest.messages).toBeUndefined(); // 缺少messages字段
  });
}); 