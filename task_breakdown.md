# ✅ JobPrep 系统开发任务清单（按阶段划分）

---

## 🔵 Phase 0：项目骨架、CI/CD、测试基础设施 ✅ _必须先完成_

> ✅ 目标：构建最小可部署系统（mock数据 + 接口联通），CI/CD 和测试体系优先就位

### 🔹 工程结构与工具链

- [ ] 创建 monorepo 项目结构（推荐使用 `pnpm workspace` / `Turborepo`）：

jobprep/
├── apps/
│   ├── backend/ (FastAPI)
│   └── frontend/ (Next.js)
└── .github/workflows/

- [ ] 配置多环境 `.env` 管理机制（本地 / 线上 / secrets）

### 🔹 后端（FastAPI）

- [ ] 初始化 FastAPI 项目结构（模块化、`src/` 布局）
- [ ] 实现一个 mock 接口 `/api/profile`，返回固定结构化用户信息
- [ ] 编写测试（pytest）：
- [ ] 基本接口返回测试
- [ ] CI 环境下测试运行
- [ ] 配置 Fly.io 部署
- [ ] `Dockerfile`、`fly.toml`、健康检查
- [ ] `.github/workflows/backend.yml`：推送触发部署
- [ ] 支持 secrets 注入（如 API 密钥）

### 🔹 前端（Next.js + Tailwind + shadcn/ui）

- [ ] 初始化前端项目（TypeScript + App Router）
- [ ] 配置 Tailwind CSS + shadcn/ui + eslint/prettier
- [ ] 创建页面 `/demo`，点击按钮 → 请求 `/api/profile` → 展示 JSON
- [ ] 加入前端测试框架（Vitest / Playwright）
- [ ] 配置 Vercel 自动部署
- [ ] `.github/workflows/frontend.yml`：lint、test、build
- [ ] 环境变量区分本地 / 生产

---

## 🟠 Phase 1：简历结构化功能（核心主线一）

> 🎯 用户上传简历（Markdown/文本）→ LLM 提取结构化信息 → 显示用户档案

### 🔹 简历后端

- [ ] 定义 `/api/parse_resume` 接口：
- 接收简历纯文本
- 返回结构化后的用户信息（符合 `UserProfile` 模型）
- [ ] 编写 DashScope 调用模块
- [ ] Prompt 模板封装（适配中文简历）
- [ ] 接口调用模块封装（支持超时重试、错误格式化）
- [ ] 添加 LLM mock 层（用于测试）
- [ ] 单元测试：
- [ ] Prompt 输出测试
- [ ] 调用异常处理测试

### 🔹 简历前端

- [ ] 页面：上传简历（支持复制粘贴 / 文件上传）
- [ ] 调用 `/api/parse_resume`，展示结构化字段：
- 姓名、邮箱、教育、工作经历、技能、项目
- [ ] UI：shadcn 的 Card/Accordion 分组展示字段
- [ ] 错误处理 / loading 状态管理
- [ ] 可选：展示原始文本与提取结果对照

---

## 🟡 Phase 2：JD 驱动求职流程（主线二）

> 🎯 上传职位描述（JD）→ 匹配用户简历 → 分析差距 → 返回建议

### 🔹 JD 后端

- [ ] 定义 `JobApplicationSession` 数据结构
- [ ] 接口 `/api/analyze_match`
- 参数：简历文本 + JD 文本
- 输出：匹配度评分、强匹配点、缺失点、建议修改内容
- [ ] DashScope Prompt 编写：
- [ ] 匹配分析 prompt
- [ ] 返回结构化 JSON（匹配度、分析内容）
- [ ] 添加接口测试 / 异常模拟

### 🔹 JD 前端

- [ ] 页面：粘贴 JD 文本 → 发起匹配请求
- [ ] 展示内容：
- 匹配度评分（Progress Ring 或百分比）
- 缺失点列表
- 修改建议（Text block / Tip）
- [ ] 可选交互：
- “为我自动生成一版修改简历”占位功能
- 将本次分析保存为历史记录（需配合存储）

---

## 🟢 Phase 3：增强功能与体验优化（可迭代）

> 🎯 增强用户体验、持久存储、支持多 JD、多轮任务与模拟面试

### 🔹 用户与数据持久化

- [ ] 加入用户系统（Auth0 / Magic Link / 临时 token 机制）
- [ ] 建立持久数据存储（SQLite / Supabase / Tinybase）：
- 用户 Profile
- JD 记录
- 分析历史记录
- [ ] 支持多简历版本存储 / 管理

### 🔹 模拟面试功能（可选）

- [ ] 页面：用户进入模拟面试模式
- [ ] 接口：系统从 JD + 简历生成 N 个高频面试问题
- [ ] 用户回答后可获得反馈建议（DashScope 多轮对话）

### 🔹 项目完善与可交付准备

- [ ] 完善错误提示、边界情况处理
- [ ] 添加日志系统（结构化日志 + 调用追踪）
- [ ] 项目 README + 部署说明文档
- [ ] 录制演示视频或 gif
- [ ] 添加演示链接（Vercel/Fly.io Preview）

---

## 📎 附录：技术选型约束（来自 system_architecture.md）

| 类别 | 选型 |
|------|------|
| LLM 接口 | DashScope（阿里百炼） |
| 后端 | FastAPI |
| 前端 | Next.js + Tailwind CSS + shadcn/ui |
| 状态管理 | React Context / 内建 Hook |
| 数据库（后期） | SQLite（优先轻量方案） |
| 部署 | 前端 Vercel / 后端 Fly.io |
| 测试 | pytest（后端） / Vitest / Playwright（前端） |
| CI/CD | GitHub Actions（前后端分流） |
