# JobPrep Backend - FastAPI Demo

这是一个最小的FastAPI Demo，用于验证后端服务是否正常运行。

## 功能特性

- ✅ FastAPI 应用框架
- ✅ CORS 支持（跨域请求）
- ✅ 环境变量配置
- ✅ 健康检查端点
- ✅ API 文档自动生成
- ✅ 单元测试

## API 端点

### GET /test

测试端点，返回后端运行状态

```json
{
  "message": "Backend is up and running"
}
```

### GET /healthz

健康检查端点，用于部署监控

```json
{
  "status": "healthy",
  "service": "jobprep-backend"
}
```

### GET /docs

API 文档（Swagger UI）

### GET /redoc

API 文档（ReDoc）

## 快速开始

### 1. 安装依赖

```bash
# 激活虚拟环境
source ../../venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 运行服务器

```bash
# 方式1：使用启动脚本
python run.py

# 方式2：直接使用 uvicorn
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 测试API

```bash
# 测试 /test 端点
curl http://localhost:8000/test

# 测试健康检查
curl http://localhost:8000/healthz

# 查看API文档
open http://localhost:8000/docs
```

### 4. 运行测试

```bash
python -m pytest tests/ -v
```

## 环境变量

创建 `.env` 文件（可选）：

```env
APP_ENV=development
PORT=8000
DASHSCOPE_API_KEY=your_api_key_here
```

## 项目结构

```text
apps/backend/
├── src/
│   ├── main.py          # FastAPI 应用入口
│   ├── config.py        # 配置管理
│   ├── routers/         # API 路由
│   ├── services/        # 业务逻辑
│   ├── models/          # 数据模型
│   └── llm/            # LLM 集成
├── tests/
│   └── test_main.py    # 单元测试
├── requirements.txt    # 依赖包
├── run.py             # 启动脚本
└── README.md          # 说明文档
```

## 开发规范

- 所有API路由都应对应一个service层调用
- 使用统一的响应格式
- 错误处理使用HTTPException
- 代码注释使用英文
- 测试覆盖所有端点
