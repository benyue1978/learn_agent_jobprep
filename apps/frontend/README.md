# 求职助手前端应用

这是一个基于 Next.js 15 的现代化前端应用，提供 AI 驱动的简历分析和优化功能。

## 功能特性

### 🚀 核心功能

- **简历上传**: 支持 Markdown 和纯文本格式的简历内容上传
- **AI 解析**: 使用后端 AI 服务自动解析和结构化简历数据
- **简历编辑**: 查看和编辑解析后的结构化简历数据
- **智能建议**: 获取 AI 提供的简历优化建议

### 📱 页面结构

- `/` - 首页（根据简历状态自动跳转）
- `/upload` - 简历上传页面
- `/edit` - 简历编辑页面
- `/test` - 后端测试页面

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks
- **字体**: Geist Sans & Geist Mono

## 开发环境

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

## 环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API 集成

前端应用与后端 API 集成，支持以下接口：

### 简历相关接口

- `POST /api/parse_resume` - 解析简历文本
- `GET /api/resume` - 获取当前简历数据

### 系统接口

- `GET /api/test` - 测试接口
- `GET /api/healthz` - 健康检查

## 项目结构

```text
src/
├── app/                    # Next.js App Router 页面
│   ├── edit/              # 简历编辑页面
│   ├── test/              # 后端测试页面
│   ├── upload/            # 简历上传页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── BackendTest.tsx    # 后端测试组件
│   └── Navigation.tsx     # 导航组件
└── lib/                   # 工具库
    └── api.ts             # API 客户端
```

## 开发规范

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

## 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

构建后的文件位于 `.next` 目录，可以部署到任何支持 Node.js 的平台。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
