# JobPrep Backend - LangGraph 实现

## 🎯 项目概述

这是一个基于 LangGraph + FastAPI 的简历解析和优化后端系统。系统使用 LangGraph 驱动整个简历解析和聊天交互流程，确保每个步骤都有严格的验证和错误处理。

## 🏗️ 架构设计

### LangGraph 工作流

#### 简历解析工作流

```mermaid
graph TD
    A[用户提交简历文本] --> B[parse_resume: LLM生成结构化简历]
    B --> C[validate_resume: 本地校验resume结构完整性]
    C -->|有效| D[generate_suggestions: LLM生成建议]
    D --> E[validate_suggestions: 本地校验引用是否存在]
    E --> F[combine_result: 合成输出]
    C -->|无效| G[返回结构不合法错误，终止流程]
    E -->|无效| H[返回建议引用错误，终止流程]
```

#### 聊天交互工作流

```mermaid
graph TD
    A[用户发送消息] --> B[format_context: 格式化简历上下文]
    B --> C[format_history: 格式化聊天历史]
    C --> D[process_chat: LLM处理聊天]
    D --> E[extract_actions: 提取建议动作]
    E --> F[return_response: 返回响应]
```

### 核心组件

1. **LangGraph 工作流**
   - `src/langgraph/parse_resume/workflow.py` - 简历解析工作流
   - `src/langgraph/chat/workflow.py` - 聊天交互工作流
   - 完整的状态管理和条件分支

2. **数据模型** (`src/models/`)
   - `resume.py` - 简历数据模型，包含严格的验证规则
   - `chat.py` - 聊天消息模型
   - 支持字段路径解析和动态更新

3. **服务层** (`src/services/`)
   - `resume_service.py` - 简历服务，封装简历相关业务逻辑
   - `chat_service.py` - 聊天服务，封装聊天相关业务逻辑

4. **API 路由** (`src/routers/`)
   - `/api/parse_resume` - 使用 LangGraph 解析简历
   - `/api/resume` - 获取当前简历 (GET) / 保存完整简历 (POST)
   - `/api/accept_suggestion` - 接受优化建议
   - `/api/chat` - 聊天交互

## 🚀 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行服务

```bash
python run.py
```

### 运行测试

```bash
# 运行所有测试
python -m pytest tests/ -v

# 运行特定测试
python -m pytest tests/test_parse_resume_workflow.py -v
python -m pytest tests/test_chat_workflow.py -v
python -m pytest tests/test_api_integration.py -v
```

## 📋 API 接口

### 解析简历

```bash
POST /api/parse_resume
Content-Type: application/json

{
  "text": "张三\n邮箱: zhangsan@example.com\n教育: 清华大学\n工作: 阿里巴巴"
}
```

**响应示例：**

```json
{
  "resume": {
    "basics": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "location": "北京",
      "summary": "经验丰富的软件工程师"
    },
    "education": [
      {
        "institution": "清华大学",
        "degree": "计算机科学学士",
        "field_of_study": "计算机科学与技术",
        "start_date": "2018-09",
        "end_date": "2022-07",
        "gpa": "3.8/4.0"
      }
    ],
    "work": [
      {
        "company": "阿里巴巴",
        "position": "高级软件工程师",
        "start_date": "2022-08",
        "end_date": "2024-12",
        "description": "负责电商平台后端开发",
        "achievements": [
          "优化系统性能，提升响应速度30%",
          "设计并实现微服务架构"
        ]
      }
    ],
    "skills": [
      {
        "name": "Java",
        "level": "高级",
        "category": "编程语言"
      }
    ],
    "certificates": [
      {
        "name": "AWS认证解决方案架构师",
        "issuer": "Amazon Web Services",
        "date": "2023-06",
        "description": "云架构设计和部署认证"
      }
    ]
  },
  "suggestions": [
    {
      "field": "work[0].description",
      "current": "负责电商平台后端开发",
      "suggested": "负责阿里巴巴电商平台后端开发，处理高并发订单系统",
      "reason": "添加具体公司名称和更详细的技术描述"
    }
  ]
}
```

### 获取简历

```bash
GET /api/resume
```

**响应示例：**

```json
{
  "resume": {
    "basics": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "location": "北京",
      "summary": "经验丰富的软件工程师"
    },
    "education": [...],
    "work": [...],
    "skills": [...],
    "certificates": [...]
  }
}
```

### 保存简历

```bash
POST /api/resume
Content-Type: application/json

{
  "resume": {
    "basics": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "location": "北京",
      "summary": "经验丰富的软件工程师"
    },
    "education": [...],
    "work": [...],
    "skills": [...],
    "certificates": [...]
  }
}
```

**响应示例：**

```json
{
  "status": "ok"
}
```

### 接受建议

```bash
POST /api/accept_suggestion
Content-Type: application/json

{
  "field": "work[0].description",
  "suggested": "负责阿里巴巴电商平台后端开发，处理高并发订单系统"
}
```

**响应示例：**

```json
{
  "resume": {
    "basics": {...},
    "work": [
      {
        "company": "阿里巴巴",
        "position": "高级软件工程师",
        "description": "负责阿里巴巴电商平台后端开发，处理高并发订单系统",
        ...
      }
    ],
    ...
  }
}
```

### 聊天交互

```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "你好，请帮我分析一下我的简历"}
  ]
}
```

**响应示例：**

```json
{
  "response": "你好！我很乐意帮你分析简历。我看到你的简历包含了基本信息和一些工作经验。让我为你提供一些具体的建议...",
  "actions": [
    {
      "type": "suggest_improvement",
      "field": "basics.summary",
      "description": "建议优化个人总结，使其更加具体和有针对性"
    }
  ]
}
```

## 🧪 测试覆盖

### 分层测试策略

1. **单元测试** (Unit Tests)
   - `test_field_parsing.py` - 字段路径解析 (5个测试)
   - `test_resume_service.py` - 简历服务 (9个测试)
   - `test_chat_service.py` - 聊天服务 (8个测试)

2. **LangGraph 工作流测试** (Workflow Tests)
   - `test_parse_resume_workflow.py` - 简历解析工作流 (10个测试)
   - `test_chat_workflow.py` - 聊天工作流 (10个测试)

3. **API 集成测试** (API Integration Tests)
   - `test_api_integration.py` - API 端点集成 (17个测试)
   - `test_chat_api.py` - 聊天API测试 (10个测试)
   - `test_main.py` - 主应用功能 (2个测试)

### 测试统计

总计：**83个测试用例**，100%通过率

### 测试运行

```bash
# 运行所有测试
python -m pytest tests/ -v

# 运行特定层级测试
python -m pytest tests/test_field_parsing.py -v
python -m pytest tests/test_parse_resume_workflow.py -v
python -m pytest tests/test_chat_workflow.py -v
python -m pytest tests/test_api_integration.py -v
```

## 🔧 技术栈

- **FastAPI** - 现代、快速的 Web 框架
- **LangGraph** - 状态图工作流引擎
- **Pydantic V2** - 数据验证和序列化
- **Pytest** - 测试框架
- **Mock LLM** - 开发阶段使用模拟数据

## 📁 项目结构

```text
apps/backend/
├── src/
│   ├── langgraph/
│   │   ├── parse_resume/
│   │   │   ├── workflow.py      # 简历解析工作流
│   │   │   └── nodes.py         # 工作流节点
│   │   └── chat/
│   │       ├── workflow.py      # 聊天工作流
│   │       └── nodes.py         # 聊天节点
│   ├── models/
│   │   ├── resume.py            # 简历数据模型
│   │   └── chat.py              # 聊天数据模型
│   ├── services/
│   │   ├── resume_service.py    # 简历服务
│   │   └── chat_service.py      # 聊天服务
│   ├── routers/
│   │   ├── resume.py            # 简历相关 API
│   │   └── chat.py              # 聊天相关 API
│   ├── llm/
│   │   ├── client.py            # LLM 客户端
│   │   └── prompts.py           # 提示词模板
│   ├── config.py                # 配置管理
│   └── main.py                  # 应用入口
├── tests/
│   ├── test_parse_resume_workflow.py  # 简历解析工作流测试
│   ├── test_chat_workflow.py          # 聊天工作流测试
│   ├── test_api_integration.py        # API 集成测试
│   ├── test_chat_api.py               # 聊天API测试
│   ├── test_resume_service.py         # 简历服务测试
│   ├── test_chat_service.py           # 聊天服务测试
│   ├── test_field_parsing.py          # 字段解析测试
│   ├── test_main.py                   # 主应用测试
│   └── README.md                      # 测试文档
├── run.py                             # 启动脚本
└── requirements.txt
```

## 🎯 核心特性

### 1. 双工作流架构

- **简历解析工作流**：专门处理简历文本的结构化解析和优化建议
- **聊天交互工作流**：处理用户聊天请求，提供智能回复和动作建议
- 每个工作流都有独立的状态管理和错误处理

### 2. 严格验证

- 简历结构完整性验证
- 建议引用有效性验证
- Pydantic V2 模型验证
- 聊天消息格式验证

### 3. 错误处理

- 详细的错误信息
- 优雅的错误恢复
- 用户友好的错误提示
- 分层错误处理策略

### 4. 可扩展性

- 模块化设计
- 易于添加新的验证规则
- 支持不同的 LLM 提供商
- 服务层抽象，便于扩展

### 5. 测试覆盖

- 完整的单元测试覆盖
- 工作流集成测试
- API 端到端测试
- 83个测试用例，100%通过率

## 🔮 未来改进

1. **真实 LLM 集成**
   - 替换 Mock 数据为真实的 DashScope 或 OpenAI API
   - 添加 LLM 调用重试和错误处理
   - 支持多种 LLM 提供商

2. **持久化存储**
   - 添加数据库支持
   - 用户会话管理
   - 简历版本控制

3. **性能优化**
   - 添加缓存机制
   - 异步处理优化
   - 工作流并行化

4. **监控和日志**
   - 添加详细的日志记录
   - 性能监控和指标
   - 错误追踪和分析

5. **功能扩展**
   - 简历模板系统
   - 多语言支持
   - 简历评分系统
