import os
from dotenv import load_dotenv

# 自动加载 apps/backend/.env 文件
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
APP_ENV = os.getenv("APP_ENV", "development")
PORT = int(os.getenv("PORT", 8000))