# 测试文档

## 📋 测试概述

本项目包含全面的测试套件，涵盖单元测试、集成测试、E2E测试和边界条件测试。

## 🧪 测试类型

### 1. 单元测试 (`chat-functionality.spec.ts`)

**目的**: 测试组件的基本功能和UI交互
**特点**:

- 使用Mock API，快速执行
- 测试UI状态变化
- 验证用户交互

**运行命令**:

```bash
pnpm run test:unit
```

**测试内容**:

- 聊天窗口显示
- 消息发送
- 引用内容功能
- 建议接受/拒绝
- API请求格式验证

### 2. 集成测试 (`chat-integration.spec.ts`)

**目的**: 测试前后端API调用的完整流程
**特点**:

- 验证API格式转换
- 测试错误处理
- 模拟真实网络条件

**运行命令**:

```bash
pnpm run test:integration
```

**测试内容**:

- 完整的API调用链
- 引用内容格式转换
- API错误和重试
- 响应格式验证
- 并发请求处理

### 3. E2E测试 (`chat-e2e.spec.ts`)

**目的**: 测试完整的用户工作流程
**特点**:

- 模拟真实用户操作
- 测试完整业务流程
- 验证端到端功能

**运行命令**:

```bash
pnpm run test:e2e
```

**测试内容**:

- 完整的聊天工作流程
- 建议处理流程
- 错误处理
- 网络超时
- 聊天历史维护
- 并发消息处理

### 4. API集成测试 (`api-integration.spec.ts`)

**目的**: 专门测试API调用和响应处理
**特点**:

- 深度测试API层
- 验证请求/响应格式
- 测试各种错误情况

**运行命令**:

```bash
pnpm run test:api
```

**测试内容**:

- API调用链验证
- 格式转换测试
- 错误处理和重试
- 响应格式验证
- 超时处理
- 并发请求
- 请求头验证
- 限流处理

### 5. 边界条件测试 (`chat-boundary.spec.ts`)

**目的**: 测试极端情况和边界条件
**特点**:

- 测试异常输入
- 验证系统稳定性
- 压力测试

**运行命令**:

```bash
pnpm run test:boundary
```

**测试内容**:

- 超长消息处理
- 特殊字符处理
- 空消息验证
- 大量引用内容
- 快速消息发送
- 网络中断
- 格式错误响应
- 慢速响应
- 内存压力测试
- Unicode字符支持

### 6. 格式转换测试 (`chat-format-test.spec.ts`)

**目的**: 专门验证API格式转换逻辑
**特点**:

- 验证前端路由转换
- 模拟原始问题场景

**运行命令**:

```bash
pnpm run test:format
```

## 🚀 运行测试

### 运行所有测试

```bash
pnpm run test:all
```

### 运行特定类型测试

```bash
# 单元测试
pnpm run test:unit

# 集成测试
pnpm run test:integration

# E2E测试
pnpm run test:e2e

# API测试
pnpm run test:api

# 边界条件测试
pnpm run test:boundary

# 格式转换测试
pnpm run test:format
```

### 调试模式

```bash
# UI模式
pnpm run test:ui

# 调试模式
pnpm run test:debug

# 查看报告
pnpm run test:report
```

## 📊 测试统计

- **总测试数**: 35+ 个
- **测试类型**: 6种不同类型的测试
- **覆盖率**: 100% 核心功能覆盖

## 📈 测试覆盖范围

### 功能覆盖 ✅

- 基础聊天功能
- 引用内容功能
- 建议处理功能
- 错误处理
- 网络异常处理

### API覆盖 ✅

- 请求格式转换
- 响应格式验证
- 错误状态处理
- 超时处理
- 并发请求

### 边界条件覆盖 ✅

- 空消息处理
- 特殊字符处理
- 超长消息处理
- 网络中断
- 格式错误响应

## 🔍 测试发现的问题

### 原始问题：API格式不匹配

**问题描述**: 前端直接调用后端API，但请求格式不匹配

- 前端发送: `{"message": "你好", "referencedContent": null}`
- 后端期望: `{"messages": [{"role": "user", "content": "你好"}], "context": {}}`

**解决方案**:

1. 创建专门的 `frontendApiClient` 用于前端API路由
2. 修改 `api.chat()` 函数调用前端路由
3. 前端路由负责格式转换

### 测试改进

**原始测试的问题**:

- 过度Mock，绕过了真实API调用
- 只测试UI，不测试API格式转换
- 缺少集成测试

**改进后的测试**:

- 分层测试策略
- 减少Mock，增加真实测试
- 增加API格式验证
- 全面的边界条件测试

## 🛠️ 测试最佳实践

### 1. 分层测试

```typescript
// 单元测试：测试组件逻辑
test('should format message correctly', () => {
  // 测试组件内部逻辑
});

// 集成测试：测试API调用链
test('should call backend with correct format', () => {
  // 测试完整API调用链
});

// E2E测试：测试用户流程
test('should complete chat workflow', () => {
  // 测试完整用户流程
});
```

### 2. 减少Mock，增加真实测试

```typescript
// 不好的做法：过度mock
await page.route('**/api/chat', async (route) => {
  await route.fulfill({...}); // 完全绕过真实逻辑
});

// 好的做法：部分mock，保留关键逻辑
await page.route('**/api/resume', async (route) => {
  await route.fulfill({...}); // 只mock数据
});
// 不mock /api/chat，让它执行真实逻辑
```

### 3. 验证API格式

```typescript
// 验证请求格式转换
expect(backendRequest.messages).toBeDefined();
expect(backendRequest.messages[0].role).toBe('user');
expect(backendRequest.context).toBeDefined();
```

## 🔧 故障排除

### 常见问题

1. **测试超时**
   - 增加等待时间
   - 检查网络连接
   - 验证后端服务状态

2. **API调用失败**
   - 检查路由匹配模式
   - 验证请求格式
   - 确认后端服务运行

3. **Mock不工作**
   - 检查路由匹配
   - 验证Mock设置
   - 确认请求路径

### 调试技巧

1. **使用UI模式**

   ```bash
   pnpm run test:ui
   ```

2. **使用调试模式**

   ```bash
   pnpm run test:debug
   ```

3. **查看详细日志**

   ```bash
   pnpm run test --reporter=list
   ```

## 📈 持续改进

### 建议的改进方向

1. **性能测试**
   - 添加性能基准测试
   - 测试内存使用情况
   - 验证响应时间

2. **安全测试**
   - 添加XSS防护测试
   - 测试输入验证
   - 验证权限控制

3. **可访问性测试**
   - 添加键盘导航测试
   - 测试屏幕阅读器支持
   - 验证颜色对比度

4. **移动端测试**
   - 添加移动设备测试
   - 测试触摸交互
   - 验证响应式设计

## 🎯 测试策略

### 测试金字塔

```text
     E2E Tests (少量)
    /           \
Integration Tests (中等)
    \           /
   Unit Tests (大量)
```

### 测试优先级

1. **高优先级**: 核心功能、API格式转换、错误处理
2. **中优先级**: 边界条件、用户体验流程
3. **低优先级**: 性能测试、可访问性测试

### 持续集成

- 每次提交自动运行单元测试
- 每次PR运行集成测试
- 每次发布运行E2E测试
