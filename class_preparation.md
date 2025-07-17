# ✅ JobPrep 项目课前准备指南

欢迎参加 JobPrep 系统开发实战课程！为确保你能顺利参与项目构建、调试和部署，请在课前完成以下准备任务。整个准备过程预计耗时 **30~45 分钟**，如遇困难请提前反馈。

---

## 1. 🌐 网络与账号准备

请确保你可以访问以下网址并注册相应账号：

- [DashScope 控制台（获取 API Key）](https://bailian.console.aliyun.com/model-market)
- [Vercel 平台（部署前端）](https://vercel.com)
- [Fly.io 平台（部署后端）](https://fly.io)
- [GitHub（用于代码托管和 CI/CD）](https://github.com)

如果你已经有 GitHub 和 Vercel 账号，可直接跳过账号注册步骤。

---

## 2. 💻 本地开发环境要求

请提前安装以下工具（可使用你习惯的包管理器）：

| 工具名称 | 版本建议 | 用途 |
|----------|----------|------|
| Node.js  | ≥ 18.x   | 前端开发（Next.js） |
| Python   | 3.11.5   | 后端开发（FastAPI） |
| pnpm     | ≥ 8.x    | 包管理工具（支持 monorepo） |
| Docker   | 最新版    | 后端部署、测试 |
| Git      | 最新版    | 版本控制 |

---

### pnpm 安装方法

推荐使用 npm 全局安装：

```bash
npm install -g pnpm
```

安装完成后可用以下命令验证：

```bash
pnpm -v
```

---

### Docker 安装方法

请根据你的操作系统选择对应的安装方式：

- **macOS/Windows 用户**：  
  推荐直接下载安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)。
- **Linux 用户**：  
  可参考官方文档：[Docker Engine 安装指南](https://docs.docker.com/engine/install/)。

安装完成后可用以下命令验证：

```bash
docker --version
```

---

建议使用以下命令快速检查：

```bash
node -v
python3 --version
pnpm -v
docker --version
git --version
```

---

## 3. 🧠 注册并获取 DashScope API Key

项目默认使用阿里通义 DashScope 平台提供的 LLM 能力。请务必完成以下操作：

1. 登录控制台：<https://bailian.console.aliyun.com/model-market>
2. 进入「API 密钥」页签
3. 生成一个 API Key，并复制保存
4. 在项目启动时，将其写入 `.env` 文件（如下示例）：

```env
DASHSCOPE_API_KEY=sk-xxx-your-key
```

---

## 4. 🧰 推荐开发工具

我们推荐以下开发环境：

- [Cursor IDE（推荐）](https://www.cursor.com)  
  支持 AI 编程、文件理解和代码重构，适合本项目多模块开发。
- VS Code + 插件组合（可选）
  - 插件：Tailwind CSS IntelliSense、shadcn/ui Snippets、REST Client

---

## 5. 📦 预克隆代码仓库（如提供）

如果主讲人已提供 starter 仓库地址，请提前执行：

```bash
git clone git@github.com:benyue1978/learn_agent_jobprep.git
cd learn_agent_jobprep
pnpm install
```

---

## 6. 📝 个人简历准备

请提前准备一份**个人简历**，建议为纯文本（.txt）或 Markdown（.md）格式，内容包括：

- 基本信息（姓名、联系方式等）
- 教育经历
- 工作/项目经历
- 技能清单

后续系统演示和测试将用到你自己的简历内容。

---

## 7. ✅ 验证准备情况 Checklist

| 项目 | 状态 |
|-------------------------------|:---:|
| GitHub / Vercel / Fly.io 账号已注册 | ☐ |
| DashScope API Key 已申请并保存      | ☐ |
| 本地已安装 Node.js / Python / pnpm / Docker | ☐ |
| 成功打开过项目 starter 或模板仓库   | ☐ |
| Cursor IDE 或 VS Code 已安装并配置  | ☐ |
| 个人简历已准备（txt/md 格式）         | ☐ |

完成以上内容后，你将能顺利开始项目的初始化、CI/CD 配置与最小功能部署。
