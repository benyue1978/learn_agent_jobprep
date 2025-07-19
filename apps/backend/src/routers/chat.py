from fastapi import APIRouter, HTTPException
import logging

from src.models.resume import ChatRequest, ChatResponse
from src.services.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat request and generate AI response
    """
    logger.info("Received chat request")
    
    # Validate input
    if not request.messages:
        raise HTTPException(
            status_code=422,
            detail="Messages cannot be empty"
        )
    
    # Check if there's at least one user message
    user_messages = [msg for msg in request.messages if msg.role == "user"]
    if not user_messages:
        raise HTTPException(
            status_code=422,
            detail="At least one user message is required"
        )
    
    try:
        # Process chat
        response = await chat_service.process_chat(request)
        
        logger.info("Chat response generated successfully")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat: {str(e)}"
        )


@router.get("/chat/test")
async def test_chat():
    """
    Test endpoint for chat functionality
    """
    try:
        # Create a test chat request
        from src.models.resume import ChatMessage
        
        test_request = ChatRequest(
            messages=[
                ChatMessage(
                    role="user",
                    content="你好，请帮我分析一下我的简历"
                )
            ],
            context={
                "resume": {
                    "basics": {
                        "name": "测试用户",
                        "email": "test@example.com"
                    }
                }
            }
        )
        
        # Process the test request
        response = await chat_service.process_chat(test_request)
        
        return {
            "success": True,
            "message": "Chat test completed successfully",
            "response": response
        }
        
    except Exception as e:
        logger.error(f"Error in test_chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat test failed: {str(e)}"
        ) 