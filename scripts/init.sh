#!/bin/bash

set -e

echo "📁 初始化项目目录结构..."
mkdir -p {apps/{frontend,backend},packages/shared,.github/workflows}

echo "🛠 初始化 pnpm workspace..."
if [ ! -e pnpm-workspace.yaml ]; then
cat <<EOF > pnpm-workspace.yaml
packages:
  - 'apps/frontend'
  - 'packages/*'
EOF
fi

if [ ! -e package.json ]; then
cat <<EOF > package.json
{
  "name": "learn_agent_jobprep",
  "private": true,
  "version": "1.0.0",
  "packageManager": "pnpm@10.13.1",
  "scripts": {
    "install-all": "pnpm install",
    "init:frontend": "pnpm --filter frontend install",
    "init:backend": "node scripts/init-backend.js",
    "init": "pnpm run init:frontend && pnpm run init:backend",
    "dev": "pnpm --filter frontend dev",
    "build": "pnpm --filter frontend build",
    "test": "pnpm --filter frontend test",
    "lint": "pnpm -r lint",
    "format": "pnpm -r format",
    "backend": "cd apps/backend && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
  },
  "workspaces": [
    "apps/frontend",
    "packages/*"
  ],
  "devDependencies": {
    "prettier": "^3.2.5"
  }
}
EOF
fi

echo "📦 初始化 frontend (Next.js)..."
if [ ! -e apps/frontend/package.json ]; then
cd apps/frontend
pnpm create next-app . --typescript --app --eslint --tailwind --src-dir --import-alias "@/*"
pnpm install @shadcn/ui lucide-react clsx axios zod

echo "🎨 添加 shadcn/ui 初始化..."
npx shadcn@latest init --template=next --base-color=neutral -y

mkdir -p src/components/ui
cd ../..
fi

echo "🐍 初始化 backend (FastAPI)..."
if [ ! -e apps/backend/requirements.txt ]; then
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
cd apps/backend
cat <<EOF > requirements.txt
fastapi
uvicorn
pydantic
httpx
python-dotenv
EOF
pip install -r requirements.txt
mkdir -p src/{routers,services,llm,models} tests
touch src/main.py src/config.py

cd ../..
fi

echo "✅ 生成基础 GitHub Actions CI 文件..."
if [ ! -e .github/workflows/frontend.yml ]; then
cat <<EOF > .github/workflows/frontend.yml
name: Frontend CI

on:
  push:
    paths:
      - 'apps/frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm -C apps/frontend build
EOF
fi

echo "🎉 项目结构初始化完成！"