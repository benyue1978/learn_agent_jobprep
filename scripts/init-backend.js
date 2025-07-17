// scripts/init-backend.js
import { execSync } from "child_process"
import { platform } from "os"
import { resolve } from "path"

const cwd = resolve("./")

console.log("📦 正在创建 Python 虚拟环境...")

try {
  execSync("python -m venv venv", { cwd, stdio: "inherit" })

  const pipCmd =
    platform() === "win32"
      ? "venv\\Scripts\\pip install -r apps/backend/requirements.txt"
      : ". venv/bin/activate && pip install -r apps/backend/requirements.txt"

  console.log("📥 正在安装依赖...")
  execSync(pipCmd, { cwd, stdio: "inherit", shell: true })

  console.log("✅ 后端初始化完成！")
} catch (err) {
  console.error("❌ 初始化失败:", err.message)
}