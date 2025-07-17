# 🏗 技术架构概览：JobPrep Agent 系统

我们从五个层次来梳理：前端、后端、LLM Agent 层、模型服务、部署平台。

---

## 1️⃣ 前端（Frontend）

| 项目       | 工具/平台           | 说明                                   |
|------------|---------------------|----------------------------------------|
| 前端框架   | Next.js             | 支持 SSR 和静态生成，适合构建现代 Web 应用 |
| 样式系统   | Tailwind CSS v4     | 快速构建 UI，适配移动端                |
| UI 组件库  | shadcn/ui           | 简洁现代，配合 Tailwind 使用           |
| 状态管理   | 内建 hook / React context | 控制 agent 响应、多轮对话           |
| 接口调用   | fetch / axios       | 与 FastAPI 通信                        |

---

## 2️⃣ 后端（Backend）

| 项目         | 工具/平台                | 说明                                         |
|--------------|--------------------------|----------------------------------------------|
| Web 框架     | FastAPI                  | 高性能、文档友好、支持 async                 |
| 任务调度     | 自定义 Router 或 LangGraph | 根据 agent 类型编排调用流程                 |
| Embedding API| DashScope                | 支持文本 embedding 和 chunk                  |
| Chat/改写接口| DashScope                | 调用 qwen-turbo 进行智能问答/改写            |
| 向量搜索     | ChromaDB（可选）         | 用于技能匹配或后续问答增强                   |
| 存储         | SQLite                   | 用于保存用户会话、简历草稿等                 |

---

## 3️⃣ Agent 层（核心逻辑模块）

| 类型                | 工具/方法                | 说明                                 |
|---------------------|--------------------------|--------------------------------------|
| ResumeMatchAgent    | prompt template + embedding | 计算简历与 JD 的匹配度           |
| ResumeEditorAgent   | prompt + RAG（可选）     | 自动优化简历段落                      |
| InterviewAgent      | prompt + context reasoning | 行为面试问答生成                   |
| TechQuizAgent       | keyword prompt            | 输出技术题 + 标准答案                |
| Agent 调度方式      | LangGraph / Python router | 支持多轮、分支式任务流程控制         |

---

## 4️⃣ 模型与 API 服务（LLM 层）

| 类型           | 工具/平台                | 说明                                         |
|----------------|--------------------------|----------------------------------------------|
| 语言模型（chat）| DashScope qwen-turbo     | 用于 prompt 回复、改写、问答等               |
| 向量模型（embedding）| DashScope text-embedding-v1 | 将文本转为语义向量，用于匹配/检索     |

---

## 5️⃣ 部署平台（DevOps & Hosting）

| 类型           | 工具/平台                | 说明                                         |
|----------------|--------------------------|----------------------------------------------|
| 应用部署       | Fly.io                   | 免费托管 FastAPI，全球边缘部署               |
| 域名 / TLS     | Fly.io 默认支持          | 自动申请 TLS 证书，可绑定自定义域名          |
| 模型调用       | DashScope API            | 不用部署本地模型，使用阿里云托管             |
| 日志 / 监控（可选）| Fly.io logs           | CLI 可查看日志，后续可集成 Logtail / Sentry  |
| 持久化存储     | Fly.io Volumn                   | 支持数据持久化存储                          |

---

## 6️⃣ 开发工具链

| 工具           | 说明                                         |
|----------------|----------------------------------------------|
| Cursor / 通义灵码 | 支持 AI 编程辅助                          |
| Git + GitHub    | 版本管理，协同开发                         |
| Python 环境管理 | 使用 venv + requirements.txt               |
| 包管理          | pip（后端） / npm（前端）                  |

---

## 🧠 未来扩展方向（可选）

| 扩展模块         | 技术方向                                         |
|------------------|--------------------------------------------------|
| 多轮会话记忆     | LangChain memory or SQLite                       |
| 用户登录系统     | Supabase Auth                                    |
| 多语言支持       | i18n 国际化 + 模型多语种 prompt                  |
| 模型热更新配置   | .env 或 config 文件切换模型                      |
| 本地部署模型     | Ollama + LLaMA 本地运行                         |
