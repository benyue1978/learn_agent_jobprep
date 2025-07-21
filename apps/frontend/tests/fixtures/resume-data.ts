// 测试数据工厂 - 用于创建一致的测试数据

export interface TestResume {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    suggestions?: Array<{
      field: string;
      current: string;
      suggested: string;
      reason: string;
    }>;
  };
  education: any[];
  work: any[];
  skills: any[];
  certificates: any[];
}

export interface TestChatResponse {
  reply: string;
  suggestion?: {
    field: string;
    current: string;
    suggested: string;
    reason: string;
  } | null;
  action?: {
    type: string;
    field: string;
    suggested: string;
  } | null;
}

/**
 * 创建测试简历数据
 * @param overrides 覆盖默认值的对象
 * @returns 测试简历数据
 */
export const createTestResume = (overrides: Partial<TestResume> = {}): TestResume => ({
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
  certificates: [],
  ...overrides
});

/**
 * 创建测试聊天响应
 * @param overrides 覆盖默认值的对象
 * @returns 测试聊天响应
 */
export const createTestChatResponse = (overrides: Partial<TestChatResponse> = {}): TestChatResponse => ({
  reply: '您好！我是您的简历优化助手。',
  suggestion: null,
  action: null,
  ...overrides
});

/**
 * 创建包含建议的测试响应
 * @param field 建议字段
 * @param current 当前内容
 * @param suggested 建议内容
 * @param reason 建议原因
 * @returns 包含建议的测试响应
 */
export const createTestChatResponseWithSuggestion = (
  field: string = 'basics.summary',
  current: string = '经验丰富的软件工程师',
  suggested: string = '5年经验的高级软件工程师，专注于大规模分布式系统开发',
  reason: string = '添加具体年限和更专业的技术描述'
): TestChatResponse => ({
  reply: '基于您的简历，我建议在以下几个方面进行优化',
  suggestion: {
    field,
    current,
    suggested,
    reason
  },
  action: {
    type: 'suggest_update',
    field,
    suggested
  }
});

/**
 * 创建错误响应
 * @param error 错误信息
 * @param status 状态码
 * @returns 错误响应
 */
export const createTestErrorResponse = (error: string = 'Internal server error', status: number = 500) => ({
  error,
  status
});

// 预定义的测试数据
export const TEST_RESUME_DATA = {
  basic: createTestResume(),
  withSuggestions: createTestResume({
    basics: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      location: '北京',
      summary: '经验丰富的软件工程师，专注于后端开发和系统架构',
      suggestions: [
        {
          field: 'basics.summary',
          current: '经验丰富的软件工程师，专注于后端开发和系统架构',
          suggested: '5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计',
          reason: '添加具体年限、更专业的技术描述和核心能力'
        }
      ]
    }
  }),
  empty: createTestResume({
    basics: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      suggestions: []
    }
  })
};

export const TEST_CHAT_RESPONSES = {
  basic: createTestChatResponse(),
  withSuggestion: createTestChatResponseWithSuggestion(),
  error: createTestErrorResponse(),
  timeout: null // 用于模拟超时
}; 