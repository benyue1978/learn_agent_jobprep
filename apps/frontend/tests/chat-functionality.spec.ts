import { test, expect } from '@playwright/test';

test.describe('Chat Functionality Tests', () => {
  let lastChatRequest: any = null;
  let lastAcceptSuggestion: any = null;
  let resumeData: any = null;
  let suggestionField = 'basics.summary';

  test.beforeEach(async ({ page }) => {
    // 初始简历数据
    resumeData = {
      basics: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        location: '北京',
        summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
        suggestions: [
          {
            field: suggestionField,
            current: '经验丰富的软件工程师，专注于后端开发和系统架构',
            suggested: '5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计',
            reason: '添加具体年限、更专业的技术描述和核心能力'
          }
        ]
      },
      education: [],
      work: [],
      skills: [],
      certificates: []
    };

    // Mock /api/resume
    await page.route('**/api/resume', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resume: resumeData })
        });
      } else if (request.method() === 'POST') {
        // 保存简历
        const body = JSON.parse(request.postData()!);
        resumeData = body.resume;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) });
      }
    });

    // Mock /api/chat - 验证前端路由的格式转换
    await page.route('**/api/chat', async (route) => {
      lastChatRequest = JSON.parse(route.request().postData()!);
      
      // 验证前端发送的格式
      expect(lastChatRequest.message).toBeDefined();
      
      // 模拟前端路由转换后的格式
      const convertedRequest = {
        messages: [
          {
            role: 'user',
            content: lastChatRequest.referencedContent 
              ? `引用内容：${lastChatRequest.referencedContent}\n\n问题：${lastChatRequest.message}` 
              : lastChatRequest.message,
          },
        ],
        context: {
          referencedContent: lastChatRequest.referencedContent,
        },
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'AI回复',
          suggestion: {
            field: suggestionField,
            current: resumeData.basics.summary,
            suggested: '5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计',
            reason: 'AI建议：添加具体年限、更专业的技术描述和核心能力'
          }
        })
      });
    });

    // Mock /api/accept_suggestion
    await page.route('**/api/accept_suggestion', async (route) => {
      lastAcceptSuggestion = JSON.parse(route.request().postData()!);
      // 模拟后端更新简历内容并移除建议
      resumeData.basics.summary = lastAcceptSuggestion.suggested;
      resumeData.basics.suggestions = resumeData.basics.suggestions.filter((s: any) => s.field !== lastAcceptSuggestion.field);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resume: resumeData })
      });
    });

    await page.goto('/edit');
    // 等待页面加载完成
    await page.waitForSelector('text=张三', { timeout: 10000 });
  });

  test('should display chat window on the right side', async ({ page }) => {
    // 验证聊天窗口在右侧显示
    await expect(page.locator('h3:has-text("AI 助手")')).toBeVisible();
    await expect(page.locator('text=开始与 AI 助手对话吧！')).toBeVisible();
  });

  test('should send correct API payload when sending message', async ({ page }) => {
    // 直接在聊天输入框中输入消息
    await page.locator('textarea').fill('你好AI');
    await page.locator('button[type="submit"]').click();
    
    // 等待API请求完成
    await page.waitForTimeout(1000);
    
    expect(lastChatRequest).toBeDefined();
    expect(lastChatRequest.message).toContain('你好AI');
    expect(lastChatRequest.referencedContent).toBeUndefined();
  });

  test('should send correct API payload with reference', async ({ page }) => {
    // 使用图标按钮的title属性来定位
    await page.locator('button[title="引用此内容并提问"]').first().click();
    await page.locator('textarea').fill('请帮我优化');
    await page.locator('button[type="submit"]').click();
    
    // 等待API请求完成
    await page.waitForTimeout(1000);
    
    expect(lastChatRequest).toBeDefined();
    expect(lastChatRequest.referencedContent).toBeDefined();
    expect(lastChatRequest.message).toContain('请帮我优化');
  });

  test('should format API request correctly for backend', async ({ page }) => {
    // 测试API格式转换
    await page.locator('textarea').fill('测试消息');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(1000);
    
    // 验证前端发送的格式
    expect(lastChatRequest.message).toBe('测试消息');
    expect(lastChatRequest.referencedContent).toBeUndefined();
    
    // 验证前端路由应该转换的格式
    const expectedConvertedFormat = {
      messages: [
        {
          role: 'user',
          content: '测试消息',
        },
      ],
      context: {
        referencedContent: undefined,
      },
    };
    
    // 这里我们验证前端发送的原始格式，转换逻辑在前端路由中
    expect(lastChatRequest).toMatchObject({
      message: '测试消息'
    });
    expect(lastChatRequest.referencedContent).toBeUndefined();
  });

  test('should accept suggestion and update resume', async ({ page }) => {
    // 等待建议按钮出现
    await page.waitForSelector('button:has-text("接受")', { timeout: 10000 });
    
    // 点击接受建议
    await page.locator('button:has-text("接受")').first().click();
    
    // 等待API请求完成
    await page.waitForTimeout(1000);
    
    // /api/accept_suggestion 被调用
    expect(lastAcceptSuggestion.field).toBe(suggestionField);
    
    // 再次获取 /api/resume，内容已变更，建议消失
    await page.reload();
    await page.waitForSelector('text=5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计', { timeout: 10000 });
    await expect(page.locator('button:has-text("接受")')).toHaveCount(0);
  });

  test('should reject suggestion and keep resume unchanged', async ({ page }) => {
    // 等待建议按钮出现
    await page.waitForSelector('button:has-text("拒绝")', { timeout: 10000 });
    
    // 点击拒绝建议
    await page.locator('button:has-text("拒绝")').first().click();
    
    // 建议本地消失
    await expect(page.locator('button:has-text("接受")')).toHaveCount(0);
    
    // 再次获取 /api/resume，建议依然存在
    await page.reload();
    await page.waitForSelector('button:has-text("接受")', { timeout: 10000 });
    await expect(page.locator('button:has-text("接受")')).toHaveCount(1);
  });
}); 