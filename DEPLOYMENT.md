# 🚀 部署指南

本项目采用混合部署策略：

- **前端**: 通过 GitHub Actions 自动部署到 Vercel
- **后端**: 通过 Render.com Dashboard 直接部署

## 📋 必需的 GitHub Secrets

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置以下 secrets：

### 前端部署 (Vercel) - GitHub Actions

- `VERCEL_TOKEN`: Vercel 访问令牌
- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID
- `API_URL`: 后端 API 地址 (例如: `https://your-backend.onrender.com`)

### 后端部署 (Render.com) - Dashboard 配置

- 在 Render.com Dashboard 中直接配置环境变量
- 无需在 GitHub Secrets 中设置后端相关配置

## 🔧 获取 Vercel 配置

参考 <https://vercel.com/guides/how-can-i-use-github-actions-with-vercel>

根据文档，安装Vercel CLI

在项目根目录运行 `vercel link` 命令，可以获取到以下信息：

- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID

`VERCEL_TOKEN` 在 Vercel Account Settings 中创建访问令牌

**注意**: 这里可能有个小问题，`vercel link` 命令会设置项目的 Root Directory 为
`apps/frontend`，同时 GitHub Actions 的 `working-directory` 是 `apps/frontend`。
这可能会导致执行 Deploy 的时候，找不到项目根目录。需要到 Vercel 项目配置里把
Root Directory 改为空。

## 🔧 配置 Render.com (Dashboard 部署)

1. 登录 [Render.com Dashboard](https://dashboard.render.com)
2. 创建新的 **Web Service**
3. 连接 GitHub 仓库 (选择 `apps/backend` 目录)
4. 配置构建设置：
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. 在 **Environment Variables** 中设置：
   - `DASHSCOPE_API_KEY`: 你的 DashScope API 密钥
   - `APP_ENV`: `production`
6. 启用 **Auto-Deploy** (推送代码时自动部署)

## 🔗 连接前后端

1. 先在 Render.com Dashboard 中部署后端服务
2. 获取 Render.com 提供的 URL (例如: `https://your-app.onrender.com`)
3. 将此 URL 设置为 GitHub Secret `API_URL`
4. 推送代码到 GitHub，触发前端自动部署到 Vercel
5. 前端构建时会使用这个 URL 作为 API 基础地址

## 📋 部署流程

### 首次部署

1. **后端**: 在 Render.com Dashboard 创建 Web Service
2. **后端**: 配置环境变量和构建设置
3. **后端**: 手动触发首次部署
4. **前端**: 配置 GitHub Secrets (包括后端URL)
5. **前端**: 推送代码触发 GitHub Actions 部署

### 后续更新

- **后端**: 推送代码到 `apps/backend/` 目录，Render.com 自动部署
- **前端**: 推送代码到 `apps/frontend/` 目录，GitHub Actions 自动部署到 Vercel

## 🧪 测试部署

### 后端测试

- 访问 `https://your-backend.onrender.com/healthz`
- 应该返回健康检查状态

### 前端测试

- 访问 Vercel 部署的 URL
- 检查 `/demo` 页面是否能正常显示

## 📝 注意事项

1. **环境变量**:
   - 前端环境变量通过 GitHub Secrets 配置
   - 后端环境变量通过 Render.com Dashboard 配置
2. **CORS**: 后端需要配置 CORS 以允许前端访问
3. **健康检查**: 后端提供 `/healthz` 端点用于部署监控
4. **自动部署**:
   - 后端通过 Render.com Dashboard 自动部署
   - 前端通过 GitHub Actions 自动部署到 Vercel
5. **目录结构**: Render.com 服务需要指向 `apps/backend` 目录

## 🔍 故障排除

### API_URL 错误

如果遇到 `Context access might be invalid: API_URL` 错误：

1. 检查 GitHub Secrets 中是否设置了 `API_URL`
2. 确保 URL 格式正确 (包含 `https://`)
3. 确保后端服务已成功部署并可访问

### 后端部署失败

1. 检查 Render.com Dashboard 中的构建日志
2. 验证环境变量是否正确配置
3. 确保后端代码中没有语法错误
4. 检查 `apps/backend` 目录结构是否正确

### 前端部署失败

1. 检查 GitHub Actions 日志
2. 验证所有必需的 Vercel secrets 都已配置
3. 确保前端代码中没有语法错误
