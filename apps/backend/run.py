#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend server
"""
import uvicorn
from src.config import PORT, APP_ENV

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=APP_ENV == "development",
        log_level="info"
    ) 