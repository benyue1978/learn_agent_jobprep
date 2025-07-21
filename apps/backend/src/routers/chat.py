from fastapi import APIRouter, HTTPException
import logging

from src.models.chat import ChatRequest, ChatResponse
from src.services.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await chat_service.process_chat(request)
        return result
    except ValueError as e:
        # Handle validation errors from service layer
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
