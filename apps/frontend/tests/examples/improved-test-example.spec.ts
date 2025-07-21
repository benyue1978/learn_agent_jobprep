import { test, expect } from '@playwright/test';
import { 
  createTestResume, 
  createTestChatResponse, 
  createTestChatResponseWithSuggestion,
  TEST_RESUME_DATA,
  TEST_CHAT_RESPONSES 
} from '../fixtures/resume-data';
import { 
  mockResumeAPI, 
  mockChatAPI, 
  mockChatAPIError, 
  createFullAPIMocks,
  cleanupMocks 
} from '../mocks/api-mocks';

test.describe('改进的测试示例', () => {
  test('使用测试数据工厂的示例', async ({ page }) => {
    // 使用预定义的测试数据
    const resumeData = TEST_RESUME_DATA.basic;
    const chatResponse = TEST_CHAT_RESPONSES.basic;
    
    // 设置Mock
    const mocks = createFullAPIMocks(page, {
      resume: resumeData,
      chatResponse: chatResponse
    });
    
    try {
      await page.goto('/edit');
      await page.waitForSelector('text=张三', { timeout: 10000 });
      
      // 发送消息
      await page.locator('textarea').fill('你好');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // 验证响应
      await expect(page.locator('text=您好！我是您的简历优化助手。')).toBeVisible();
    } finally {
      cleanupMocks(mocks);
    }
  });

  test('使用自定义测试数据的示例', async ({ page }) => {
    // 创建自定义测试数据
    const customResume = createTestResume({
      basics: {
        name: '李四',
        email: 'lisi@example.com',
        phone: '13900139000',
        location: '上海',
        summary: '前端开发工程师，专注于React和TypeScript',
        suggestions: []
      }
    });
    
    const customChatResponse = createTestChatResponse({
      reply: '你好李四！我是你的简历优化助手。'
    });
    
    // 设置Mock
    const mocks = createFullAPIMocks(page, {
      resume: customResume,
      chatResponse: customChatResponse
    });
    
    try {
      await page.goto('/edit');
      await page.waitForSelector('text=李四', { timeout: 10000 });
      
      // 发送消息
      await page.locator('textarea').fill('你好');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // 验证响应
      await expect(page.locator('text=你好李四！我是你的简历优化助手。')).toBeVisible();
    } finally {
      cleanupMocks(mocks);
    }
  });

  test('测试建议功能的示例', async ({ page }) => {
    // 使用包含建议的测试数据
    const resumeWithSuggestions = TEST_RESUME_DATA.withSuggestions;
    const chatResponseWithSuggestion = createTestChatResponseWithSuggestion();
    
    // 设置Mock
    const mocks = createFullAPIMocks(page, {
      resume: resumeWithSuggestions,
      chatResponse: chatResponseWithSuggestion
    });
    
    try {
      await page.goto('/edit');
      await page.waitForSelector('text=张三', { timeout: 10000 });
      
      // 发送消息获取建议
      await page.locator('textarea').fill('请给我一些建议');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // 验证建议显示
      await expect(page.locator('button:has-text("接受")').first()).toBeVisible();
      await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();
    } finally {
      cleanupMocks(mocks);
    }
  });

  test('测试错误处理的示例', async ({ page }) => {
    // 使用错误响应
    const resumeData = TEST_RESUME_DATA.basic;
    
    // 设置Mock，包含错误
    const mocks = createFullAPIMocks(page, {
      resume: resumeData,
      chatError: { error: 'Internal server error', status: 500 }
    });
    
    try {
      await page.goto('/edit');
      await page.waitForSelector('text=张三', { timeout: 10000 });
      
      // 发送消息
      await page.locator('textarea').fill('你好');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // 验证错误处理
      await expect(page.locator('text=抱歉，发送消息时出现错误，请稍后重试。')).toBeVisible();
    } finally {
      cleanupMocks(mocks);
    }
  });

  test('参数化测试示例', async ({ page }) => {
    // 定义测试数据
    const testCases = [
      {
        name: '普通消息',
        input: '你好',
        expectedResponse: '您好！我是您的简历优化助手。'
      },
      {
        name: '请求建议',
        input: '请给我建议',
        expectedResponse: '基于您的简历，我建议在以下几个方面进行优化'
      },
      {
        name: '引用内容',
        input: '请帮我优化这部分',
        expectedResponse: '基于您引用的内容，我建议...'
      }
    ];
    
    for (const testCase of testCases) {
      await test.step(testCase.name, async () => {
        // 根据测试用例创建响应
        const chatResponse = createTestChatResponse({
          reply: testCase.expectedResponse
        });
        
        // 设置Mock
        const mocks = createFullAPIMocks(page, {
          resume: TEST_RESUME_DATA.basic,
          chatResponse: chatResponse
        });
        
        try {
          await page.goto('/edit');
          await page.waitForSelector('text=张三', { timeout: 10000 });
          
          // 发送消息
          await page.locator('textarea').fill(testCase.input);
          await page.locator('button[type="submit"]').click();
          await page.waitForTimeout(2000);
          
          // 验证响应
          await expect(page.locator(`text=${testCase.expectedResponse}`)).toBeVisible();
        } finally {
          cleanupMocks(mocks);
        }
      });
    }
  });
}); 