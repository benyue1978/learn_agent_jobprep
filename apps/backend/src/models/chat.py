from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .resume import Suggestion

class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Message role (user/assistant)")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    """Chat request model"""
    messages: List[ChatMessage] = Field(..., min_length=1, description="Chat messages")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context information")

class ChatResponse(BaseModel):
    """Chat response model"""
    reply: str = Field(..., description="Assistant reply")
    action: Optional[Dict[str, Any]] = Field(None, description="Optional action to take")

# LangGraph Chat State Model
class ChatState(BaseModel):
    """State for LangGraph chat workflow"""
    text: str = Field(..., description="User input text")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Chat history")
    resume: Dict[str, Any] = Field(..., description="Current resume data")
    latest_suggestion: Optional[Suggestion] = Field(None, description="Latest generated suggestion")
    response: Optional[str] = Field(None, description="AI response text")
    finalized: bool = Field(False, description="Whether the suggestion is finalized")
    intent: Optional[str] = Field(None, description="User intent (request_suggestion, confirm_suggestion, reject_suggestion, chat)") 