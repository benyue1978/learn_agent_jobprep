# JobPrep 项目 - 快速启动指南（Windows 用户）

## 🛠 环境准备

请先根据课程材料 [class_preparation.md](./class_preparation.md) 安装以下工具：

- [Node.js](https://nodejs.org/) (建议 ≥18)
- [pnpm](https://pnpm.io/)
- [Python 3.10+](https://www.python.org/)
- [Git](https://git-scm.com/)

---

## 🚀 初始化项目

### 1. 克隆代码

```bash
git clone git@github.com:benyue1978/learn_agent_jobprep.git
cd learn_agent_jobprep
```

### 2. 安装依赖并初始化前后端

```bash
pnpm install         # 安装根目录依赖
pnpm run init        # 初始化 frontend + backend
```

注意：每次打开新 Terminal 之后，一定要重新激活 Python 虚拟环境，否则后端无法启动。

```bash
venv\Scripts\activate #windows
source venv/bin/activate #mac
```

⸻

## ▶️ 启动项目

### 启动前端（Next.js）

```bash
pnpm dev
```

默认运行在：<http://localhost:3000>

⸻

### 启动后端（FastAPI）

```bash
pnpm backend
```

默认运行在：<http://localhost:8000/docs>

⸻

## 📦 目录结构说明（简要）

```text
learn_agent_jobprep/
├── apps/
│   ├── frontend/        # Next.js 前端项目
│   └── backend/         # FastAPI 后端项目
├── packages/            # 可选共享代码
├── scripts/             # 后端初始化脚本
├── pnpm-workspace.yaml
├── package.json
```
