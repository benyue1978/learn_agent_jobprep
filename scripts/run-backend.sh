#!/bin/bash
source venv/bin/activate
cd apps/backend
uvicorn src.main:app --reload