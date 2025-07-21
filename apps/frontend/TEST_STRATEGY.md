# 前端测试策略使用指南

## 🎯 解决的核心问题

### 问题1：测试依赖后端服务

**问题描述**: 集成测试和E2E测试需要后端活着，但后端可能返回假数据

**解决方案**:

- 分层测试策略：单元测试完全Mock，集成测试Mock API响应，E2E测试可选择Mock或真实后端
- 测试数据工厂：统一管理测试数据，确保数据一致性
- 环境配置：通过环境变量控制测试模式

### 问题2：真实逻辑实现后测试失效

**问题描述**: 后端真实逻辑实现后，测试可能因为数据格式变化而失败

**解决方案**:

- 契约测试：验证API响应格式
- 数据版本控制：支持不同版本的测试数据
- 渐进式迁移：保持向后兼容

## 🏗️ 测试架构

### 测试分层

```text
┌─────────────────────────────────────┐
│           E2E Tests                 │ ← 完整用户流程
│     (Mock/Real Backend)             │
├─────────────────────────────────────┤
│        Integration Tests            │ ← API交互验证
│        (Mock API Response)          │
├─────────────────────────────────────┤
│          Unit Tests                 │ ← 组件功能验证
│        (Full Mock)                  │
└─────────────────────────────────────┘
```

### 项目配置

```typescript
// playwright.config.ts
projects: [
  {
    name: 'unit',           // 单元测试
    testMatch: /.*\.unit\.spec\.ts/,
  },
  {
    name: 'integration',    // 集成测试
    testMatch: /.*\.integration\.spec\.ts/,
  },
  {
    name: 'e2e-mock',       // E2E测试(Mock)
    testMatch: /.*\.e2e\.spec\.ts/,
  },
  {
    name: 'e2e-real',       // E2E测试(真实后端)
    testMatch: /.*\.e2e\.spec\.ts/,
    grep: /@real-backend/,
  }
]
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境

```bash
# 复制环境配置示例
cp env.test.example .env.test

# 根据需要修改配置
```

### 3. 运行测试

#### 开发阶段（推荐）

```bash
# 运行所有Mock测试（快速反馈）
pnpm test:mock

# 运行特定类型测试
pnpm test:unit
pnpm test:integration
pnpm test:e2e-mock
```

#### CI/CD阶段

```bash
# 第一阶段：Mock测试（快速反馈）
pnpm test:mock

# 第二阶段：真实后端测试（完整验证）
pnpm test:real-backend
```

#### 生产部署前

```bash
# 完整测试套件
pnpm test:all
```

## 📝 编写测试

### 1. 使用测试数据工厂

```typescript
import { createTestResume, createTestChatResponse } from '../fixtures/resume-data';

test('使用测试数据工厂', async ({ page }) => {
  // 使用预定义数据
  const resumeData = createTestResume();
  const chatResponse = createTestChatResponse();
  
  // 或者自定义数据
  const customResume = createTestResume({
    basics: {
      name: '李四',
      email: 'lisi@example.com',
      // ... 其他字段
    }
  });
});
```

### 2. 使用API Mock工厂

```typescript
import { createFullAPIMocks, cleanupMocks } from '../mocks/api-mocks';

test('使用API Mock工厂', async ({ page }) => {
  // 设置完整的API Mock
  const mocks = createFullAPIMocks(page, {
    resume: resumeData,
    chatResponse: chatResponse,
    chatError: { error: 'Internal server error', status: 500 }
  });
  
  try {
    // 执行测试
    await page.goto('/edit');
    // ... 测试逻辑
  } finally {
    // 清理Mock
    cleanupMocks(mocks);
  }
});
```

### 3. 参数化测试

```typescript
test('参数化测试示例', async ({ page }) => {
  const testCases = [
    { input: '你好', expected: '您好！我是您的简历优化助手。' },
    { input: '请给我建议', expected: '基于您的简历，我建议...' }
  ];
  
  for (const testCase of testCases) {
    await test.step(testCase.input, async () => {
      // 测试逻辑
    });
  }
});
```

## 🔧 测试数据管理

### 1. 测试数据工厂

```typescript
// tests/fixtures/resume-data.ts
export const createTestResume = (overrides = {}) => ({
  basics: {
    name: '张三',
    email: 'zhangsan@example.com',
    // ... 默认数据
  },
  ...overrides
});

export const TEST_RESUME_DATA = {
  basic: createTestResume(),
  withSuggestions: createTestResume({ /* 包含建议的数据 */ }),
  empty: createTestResume({ /* 空数据 */ })
};
```

### 2. API Mock工厂

```typescript
// tests/mocks/api-mocks.ts
export const createFullAPIMocks = (page: Page, options = {}) => {
  const mocks = [];
  
  // Mock简历API
  mocks.push(mockResumeAPI(page, options.resume));
  
  // Mock聊天API
  if (options.chatError) {
    mocks.push(mockChatAPIError(page, options.chatError.error, options.chatError.status));
  } else {
    mocks.push(mockChatAPI(page, options.chatResponse));
  }
  
  return mocks;
};
```

## 🔄 迁移策略

### 从Mock到真实数据的迁移步骤

#### 1. 保持向后兼容

```typescript
// 新API版本支持旧格式
const apiResponse = {
  reply: '新格式响应',
  suggestion: null,
  // 保持旧字段兼容
  action: null
};
```

#### 2. 数据验证

```typescript
// 契约测试确保格式一致
test('API response should match schema', async ({ request }) => {
  const response = await request.post('/api/chat', { data: testData });
  const data = await response.json();
  
  // 验证响应格式
  expect(data).toMatchSchema(chatResponseSchema);
});
```

#### 3. 测试更新

```typescript
// 逐步更新测试期望
const expectedResponse = process.env.TEST_DATA_VERSION === 'v2.0' 
  ? newFormatResponse 
  : oldFormatResponse;
```

## 📊 测试覆盖率

### 当前覆盖范围

- ✅ 单元测试：组件功能、UI交互
- ✅ 集成测试：API调用、格式转换
- ✅ E2E测试：完整用户流程
- ✅ 边界测试：异常情况处理
- ✅ 错误测试：网络错误、API错误

### 建议改进

- 🔄 性能测试：响应时间、内存使用
- 🔄 安全测试：XSS防护、输入验证
- 🔄 可访问性测试：键盘导航、屏幕阅读器
- 🔄 移动端测试：响应式设计、触摸交互

## 🛠️ 故障排除

### 常见问题

#### 1. 测试超时

```bash
# 增加超时时间
pnpm test --timeout=120000

# 检查网络连接
curl http://localhost:3000
```

#### 2. Mock不工作

```typescript
// 检查路由匹配
await page.route('**/api/chat', async (route) => {
  console.log('Mock被调用:', route.request().url());
  // Mock逻辑
});
```

#### 3. 数据不一致

```typescript
// 使用测试数据工厂确保一致性
const testData = createTestResume();
expect(testData.basics.name).toBe('张三');
```

### 调试技巧

#### 1. 使用UI模式

```bash
pnpm test:ui
```

#### 2. 使用调试模式

```bash
pnpm test:debug
```

#### 3. 查看详细日志

```bash
pnpm test --reporter=list --timeout=30000
```

## 📈 持续改进

### 建议的改进方向

1. **自动化测试**
   - 每次提交自动运行单元测试
   - 每次PR运行集成测试
   - 每次发布运行E2E测试

2. **测试监控**
   - 测试执行时间监控
   - 失败率统计
   - 覆盖率报告

3. **测试优化**
   - 并行测试执行
   - 测试数据缓存
   - 智能重试机制

## 🎯 最佳实践

### 1. 测试隔离

- 每个测试使用独立的测试数据
- 避免测试间的数据污染
- 使用 `test.beforeEach` 重置状态

### 2. 数据驱动测试

- 使用参数化测试减少重复
- 支持多种数据场景
- 保持测试数据的可维护性

### 3. 环境检测

- 自动检测测试环境
- 根据环境选择测试策略
- 支持本地和CI环境

### 4. 错误处理

- 测试网络错误和异常情况
- 验证错误恢复机制
- 确保用户体验的稳定性
