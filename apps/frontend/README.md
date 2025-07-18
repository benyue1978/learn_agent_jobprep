# JobPrep Frontend - Backend API Test

这是一个Next.js前端应用，用于测试与FastAPI后端的连接。

## 功能特性

- ✅ Next.js 15 + App Router
- ✅ TypeScript 支持
- ✅ Tailwind CSS 样式
- ✅ 后端API测试界面
- ✅ 实时连接状态显示
- ✅ 错误处理和加载状态

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 测试后端连接

确保后端服务器正在运行（默认端口8000），然后访问前端页面：

- 页面会自动测试后端连接
- 点击"Test Backend Connection"按钮手动测试
- 查看连接状态和API响应

## API 端点测试

前端会测试以下后端端点：

- `GET /test` - 测试端点
- `GET /healthz` - 健康检查端点

## 环境变量

创建 `.env.local` 文件（可选）：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 项目结构

```text
apps/frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── layout.tsx        # 布局组件
│   │   └── globals.css       # 全局样式
│   ├── components/
│   │   └── BackendTest.tsx   # 后端测试组件
│   └── lib/
│       └── api.ts           # API客户端
├── public/                  # 静态资源
├── package.json            # 依赖配置
└── README.md              # 说明文档
```

## 开发脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **UI组件**: 自定义组件 + Tailwind

## 注意事项

- 确保后端服务器在 `http://localhost:8000` 运行
- 如果后端端口不同，请设置 `NEXT_PUBLIC_API_URL` 环境变量
- 前端支持热重载，修改代码后会自动刷新
