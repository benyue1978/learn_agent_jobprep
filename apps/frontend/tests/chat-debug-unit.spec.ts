import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Chat Debug Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should display debug information correctly', async ({ page }) => {
    // 监听所有网络请求
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/chat')) {
        requests.push(request.url());
        console.log('API请求:', request.url());
        console.log('请求方法:', request.method());
        console.log('请求头:', request.headers());
        if (request.postData()) {
          console.log('请求体:', request.postData());
        }
      }
    });

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

    // Mock后端API调用 - 使用更通用的模式
    let backendRequest: any = null;
    await page.route('**/8000/**', async (route) => {
      console.log('捕获到8000端口的请求:', route.request().url());
      if (route.request().url().includes('/api/chat')) {
        backendRequest = JSON.parse(route.request().postData()!);
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
    
    // 等待一段时间观察网络请求
    await page.waitForTimeout(5000);
    
    // 输出所有捕获的请求
    console.log('所有API请求:', requests);
    console.log('后端请求:', backendRequest);
    
    // 验证至少有一个请求
    expect(requests.length).toBeGreaterThan(0);
    
    // 验证后端请求格式
    if (backendRequest) {
      expect(backendRequest.messages).toBeDefined();
      expect(backendRequest.messages[0].role).toBe('user');
      expect(backendRequest.messages[0].content).toBe('测试消息');
      expect(backendRequest.context).toBeDefined();
    }
  });
}); 