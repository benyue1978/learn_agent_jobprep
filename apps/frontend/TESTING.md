# 前端测试策略

## 测试分层架构

### 1. 单元测试 (Unit Tests)

- **目标**: 测试独立的组件和函数
- **依赖**: 无外部依赖，完全mock
- **数据**: 使用固定的测试数据
- **优势**: 快速、稳定、不依赖外部服务

### 2. 集成测试 (Integration Tests)

- **目标**: 测试组件间的交互和API调用
- **依赖**: Mock API响应
- **数据**: 使用预定义的测试数据
- **优势**: 验证集成逻辑，不依赖真实后端

### 3. E2E测试 (End-to-End Tests)

- **目标**: 测试完整的用户流程
- **依赖**: 可选择真实后端或Mock后端
- **数据**: 根据环境使用不同数据源
- **优势**: 验证真实用户体验

## 环境配置策略

### 开发环境

```typescript
// playwright.config.ts
const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'unit',
      testMatch: /.*\.unit\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:3000',
        // 完全mock所有API
      }
    },
    {
      name: 'integration',
      testMatch: /.*\.integration\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:3000',
        // Mock API响应
      }
    },
    {
      name: 'e2e-mock',
      testMatch: /.*\.e2e\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:3000',
        // Mock后端API
      }
    },
    {
      name: 'e2e-real',
      testMatch: /.*\.e2e\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:3000',
        // 真实后端API
      },
      // 只在特定条件下运行
      grep: /@real-backend/
    }
  ]
};
```

### 测试数据管理

#### 1. 测试数据工厂

```typescript
// tests/fixtures/resume-data.ts
export const createTestResume = (overrides = {}) => ({
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

export const createTestChatResponse = (overrides = {}) => ({
  reply: '您好！我是您的简历优化助手。',
  suggestion: null,
  ...overrides
});
```

#### 2. API Mock工厂

```typescript
// tests/mocks/api-mocks.ts
export const mockResumeAPI = (page: Page, data: any) => {
  return page.route('**/api/resume', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resume: data })
    });
  });
};

export const mockChatAPI = (page: Page, response: any) => {
  return page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
};
```

## 环境变量配置

### .env.test

```bash
# 测试环境配置
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_MOCK_API=true
```

### .env.test.real

```bash
# 真实后端测试环境
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_MOCK_API=false
```

## 测试运行策略

### 1. 开发阶段

```bash
# 运行所有Mock测试
pnpm test

# 运行特定类型测试
pnpm test:unit
pnpm test:integration
pnpm test:e2e-mock
```

### 2. CI/CD阶段

```bash
# 第一阶段：Mock测试（快速反馈）
pnpm test:mock

# 第二阶段：真实后端测试（完整验证）
pnpm test:real-backend
```

### 3. 生产部署前

```bash
# 完整测试套件
pnpm test:all
```

## 数据一致性保证

### 1. 契约测试

```typescript
// tests/contract/api-contract.spec.ts
test('API response should match expected schema', async ({ request }) => {
  const response = await request.post('/api/chat', {
    data: {
      message: 'test',
      referencedContent: null
    }
  });
  
  const data = await response.json();
  
  // 验证响应格式
  expect(data).toMatchSchema(chatResponseSchema);
});
```

### 2. 数据版本控制

```typescript
// tests/fixtures/data-versions.ts
export const TEST_DATA_VERSIONS = {
  'v1.0': createV1TestData(),
  'v1.1': createV1_1TestData(),
  'latest': createLatestTestData()
};
```

## 迁移策略

### 从Mock到真实数据的迁移步骤

1. **保持向后兼容**
   - 新API版本支持旧格式
   - 渐进式迁移测试数据

2. **数据验证**
   - 使用契约测试确保格式一致
   - 比较Mock和真实数据的差异

3. **测试更新**
   - 逐步更新测试期望
   - 保持测试的稳定性

## 最佳实践

### 1. 测试隔离

- 每个测试使用独立的测试数据
- 避免测试间的数据污染

### 2. 数据驱动测试

- 使用参数化测试减少重复
- 支持多种数据场景

### 3. 环境检测

- 自动检测测试环境
- 根据环境选择测试策略

### 4. 错误处理

- 测试网络错误和异常情况
- 验证错误恢复机制
