# 求职助手前端应用

这是一个基于 Next.js 的现代化前端应用，提供 AI 驱动的简历分析和优化功能。

## 🚀 功能特性

### 核心功能

- **简历上传**: 支持 Markdown 和纯文本格式的简历内容上传
- **AI 解析**: 使用后端 AI 服务自动解析和结构化简历数据
- **简历编辑**: 查看和编辑解析后的结构化简历数据
- **智能建议**: 获取 AI 提供的简历优化建议
- **聊天助手**: 与AI助手对话，获取个性化简历优化建议

### 📱 页面结构

- `/` - 首页（根据简历状态自动跳转）
- `/upload` - 简历上传页面
- `/edit` - 简历编辑页面
- `/test` - 后端测试页面

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks
- **测试框架**: Playwright
- **字体**: Geist Sans & Geist Mono

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## ⚙️ 环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📡 API 集成

前端应用与后端 API 集成，支持以下接口：

### 简历相关接口

- `POST /api/parse_resume` - 解析简历文本
- `GET /api/resume` - 获取当前简历数据
- `POST /api/chat` - 聊天接口

### 系统接口

- `GET /api/test` - 测试接口
- `GET /api/healthz` - 健康检查

## 📁 项目结构

```text
src/
├── app/                    # Next.js App Router 页面
│   ├── edit/              # 简历编辑页面
│   ├── test/              # 后端测试页面
│   ├── upload/            # 简历上传页面
│   ├── api/               # API路由
│   │   └── chat/          # 聊天API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── BackendTest.tsx    # 后端测试组件
│   ├── Navigation.tsx     # 导航组件
│   ├── chat/              # 聊天相关组件
│   └── resume/            # 简历相关组件
├── lib/                   # 工具库
│   └── api.ts             # API 客户端
└── tests/                 # 测试文件
    ├── chat-functionality.spec.ts    # 单元测试
    ├── chat-integration.spec.ts      # 集成测试
    ├── chat-e2e.spec.ts             # E2E测试
    ├── api-integration.spec.ts      # API测试
    ├── chat-boundary.spec.ts        # 边界条件测试
    └── chat-format-test.spec.ts     # 格式转换测试
```

## 🎨 开发规范

### 代码风格

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件使用 `"use client"` 指令（客户端组件）

### 组件设计

- 使用 Tailwind CSS 进行样式设计
- 支持深色模式
- 响应式设计，适配移动端和桌面端

### 状态管理

- 使用 React Hooks 进行状态管理
- 使用 `useState` 管理本地状态
- 使用 `useEffect` 处理副作用

## 🧪 测试

项目包含全面的测试套件，详细内容请查看 [TESTING.md](./TESTING.md)。

### 快速运行测试

```bash
# 运行所有测试
pnpm run test:all

# 运行单元测试
pnpm run test:unit

# 运行E2E测试
pnpm run test:e2e

# 查看测试报告
pnpm run test:report
```

## 🚀 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

构建后的文件位于 `.next` 目录，可以部署到任何支持 Node.js 的平台。

## 📈 持续改进

### 建议的改进方向

1. **性能优化**
   - 代码分割和懒加载
   - 图片优化
   - 缓存策略

2. **用户体验**
   - 加载状态优化
   - 错误处理改进
   - 可访问性提升

3. **功能扩展**
   - 多语言支持
   - 主题切换
   - 移动端优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## �� 许可证

MIT License
