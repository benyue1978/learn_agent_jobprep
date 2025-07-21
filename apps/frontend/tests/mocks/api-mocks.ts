import { Page } from '@playwright/test';
import { createTestResume, createTestChatResponse, TestResume, TestChatResponse } from '../fixtures/resume-data';

/**
 * Mock简历API
 * @param page Playwright页面对象
 * @param data 简历数据，如果不提供则使用默认测试数据
 * @returns 路由处理器
 */
export const mockResumeAPI = (page: Page, data?: TestResume) => {
  const resumeData = data || createTestResume();
  
  return page.route('**/api/resume', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resume: resumeData })
    });
  });
};

/**
 * Mock聊天API - 更新为与后端格式一致
 * @param page Playwright页面对象
 * @param response 响应数据，如果不提供则使用默认测试响应
 * @returns 路由处理器
 */
export const mockChatAPI = (page: Page, response?: TestChatResponse) => {
  const chatResponse = response || createTestChatResponse();
  
  return page.route('**/api/chat', async (route) => {
    // 检查是否是前端API路由调用
    const url = route.request().url();
    if (url.includes('localhost:3000')) {
      // 前端API路由 - 直接返回响应
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(chatResponse)
      });
    } else {
      // 后端API路由 - 使用后端格式
      const backendResponse = {
        reply: chatResponse.reply,
        action: chatResponse.suggestion ? {
          type: "suggest_update",
          field: chatResponse.suggestion.field,
          suggested: chatResponse.suggestion.suggested
        } : null
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(backendResponse)
      });
    }
  });
};

/**
 * Mock聊天API错误
 * @param page Playwright页面对象
 * @param error 错误信息
 * @param status 状态码
 * @returns 路由处理器
 */
export const mockChatAPIError = (page: Page, error: string = 'Internal server error', status: number = 500) => {
  return page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error })
    });
  });
};

/**
 * Mock聊天API超时
 * @param page Playwright页面对象
 * @returns 路由处理器
 */
export const mockChatAPITimeout = (page: Page) => {
  return page.route('**/api/chat', async (route) => {
    // 故意不调用 route.fulfill，让请求超时
  });
};

/**
 * Mock接受建议API
 * @param page Playwright页面对象
 * @param updatedResume 更新后的简历数据
 * @returns 路由处理器
 */
export const mockAcceptSuggestionAPI = (page: Page, updatedResume?: TestResume) => {
  const resumeData = updatedResume || createTestResume();
  
  return page.route('**/api/accept_suggestion', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resume: resumeData })
    });
  });
};

/**
 * 创建完整的API Mock设置
 * @param page Playwright页面对象
 * @param options Mock选项
 * @returns Mock处理器数组
 */
export const createFullAPIMocks = (page: Page, options: {
  resume?: TestResume;
  chatResponse?: TestChatResponse;
  chatError?: { error: string; status: number };
  chatTimeout?: boolean;
  acceptSuggestion?: TestResume;
} = {}) => {
  const mocks = [];
  
  // Mock简历API
  mocks.push(mockResumeAPI(page, options.resume));
  
  // Mock聊天API
  if (options.chatError) {
    mocks.push(mockChatAPIError(page, options.chatError.error, options.chatError.status));
  } else if (options.chatTimeout) {
    mocks.push(mockChatAPITimeout(page));
  } else {
    mocks.push(mockChatAPI(page, options.chatResponse));
  }
  
  // Mock接受建议API
  if (options.acceptSuggestion) {
    mocks.push(mockAcceptSuggestionAPI(page, options.acceptSuggestion));
  }
  
  return mocks;
};

/**
 * 清理所有Mock
 * @param mocks Mock处理器数组
 */
export const cleanupMocks = (mocks: any[]) => {
  mocks.forEach(mock => {
    if (mock && typeof mock === 'function') {
      mock();
    }
  });
}; 