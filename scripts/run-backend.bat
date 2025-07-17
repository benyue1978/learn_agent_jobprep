@echo off
call venv\Scripts\activate
cd apps\backend
uvicorn src.main:app --reload