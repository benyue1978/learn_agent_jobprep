# 🚀 JobPrep 项目部署指南

本项目采用分离式部署策略：

- **🧠 后端服务**：部署在 Render.com
- **🎨 前端应用**：通过 GitHub Actions 自动部署到 Vercel

---

## 🔧 第一步：部署后端到 Render.com

### 1.1 登录 Render 创建 Web Service

1. 打开 [Render.com Dashboard](https://dashboard.render.com)
2. 点击 **New Web Service**
3. 选择 GitHub 仓库，选择路径：`apps/backend`

### 1.2 配置服务参数

- **Environment**: Python 3
- **Build Command**:

  ```bash
  pip install -r requirements.txt
  ```

- **Start Command**:

  ```bash
  uvicorn src.main:app --host 0.0.0.0 --port $PORT
  ```

- **Root Directory**: `apps/backend`

### 1.3 设置环境变量

在 Render 的 **Environment** 页面中添加：

| Key | Value |
|-----|-------|
| `DASHSCOPE_API_KEY` | 你的 DashScope API 密钥 |
| `APP_ENV` | `production` |

### 1.4 启用自动部署

勾选 **Auto-Deploy**，每次推送后端代码将自动部署。

---

## 🎯 第二步：部署前端到 Vercel via GitHub Actions

### 2.1 创建 Vercel 项目（本地初始化）

1. 本地安装 Vercel CLI：

   ```bash
   npm install -g vercel
   ```

2. 进入项目根目录，执行：

   ```bash
   vercel link
   ```

   根据提示关联项目，注意：
   - **Root Directory** 填空（不要设为 `apps/frontend`）
   - 这一步会生成 `.vercel/project.json`

### 2.2 配置 Vercel 环境变量

在 Vercel 项目 Dashboard → Settings → Environment Variables 添加：

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | 你刚刚部署好的后端地址，如 `https://jobprep-api.onrender.com` | Production |

### 2.3 设置 GitHub Secrets（用于 GitHub Actions）

进入 GitHub 仓库 → Settings → Secrets → Actions，新增以下 secrets：

| Name | 用途 |
|------|------|
| `VERCEL_TOKEN` | 在 Vercel Account → Tokens 生成 |
| `VERCEL_ORG_ID` | `vercel link` 时生成 |
| `VERCEL_PROJECT_ID` | 同上 |

### 2.4 GitHub Actions 自动部署配置

项目中已有 `.github/workflows/frontend.yml`，自动触发部署，流程如下：

1. 监听 `apps/frontend/**` 的更改
2. 安装依赖并构建
3. 使用 `amondnet/vercel-action` 发布部署

---

## 🪜 项目部署流程

### ✅ 首次部署

1. **后端**：
   - 在 Render 创建 Web Service
   - 配置环境变量，手动部署成功

2. **前端**：
   - 本地执行 `vercel link`
   - 在 Vercel 设置 `API_URL` 环境变量
   - 在 GitHub 配置部署 Secrets
   - 推送代码 → 自动部署前端

### 🔁 后续部署

| 内容更新 | 操作 |
|----------|------|
| 后端更新 | 推送代码到 `apps/backend/`，Render 自动部署 |
| 前端更新 | 推送代码到 `apps/frontend/`，触发 GitHub Action 自动部署 |

---

## 🧪 测试部署成功

### ✅ 后端测试

打开：

```text
https://your-backend.onrender.com/healthz
```

应返回类似内容：

```json
{"status":"healthy","service":"jobprep-backend"}
```

### ✅ 前端测试

访问 Vercel 提供的前端地址，打开 `/demo` 页面确认能否访问 API 成功。

---

## ❗️ 常见问题与故障排查

### 🔸 API 地址无效 / 为空

- 检查 Vercel 项目中是否配置 `NEXT_PUBLIC_API_URL`
- 确保 GitHub Secrets 没有用于设置此变量（无效）
- 重新部署前端以生效新环境变量

### 🔸 Render 后端无法部署成功

- 检查日志中是否安装依赖失败
- 确保正确设置 `PORT`、`APP_ENV` 等环境变量
- 后端监听地址必须是 `0.0.0.0`

### 🔸 Vercel 前端部署失败

- 检查 GitHub Actions 日志
- 确保 `.vercel/project.json` 中路径正确或 Dashboard 中的 Root Directory 为空
