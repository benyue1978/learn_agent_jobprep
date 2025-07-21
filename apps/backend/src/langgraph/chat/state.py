"""
LangGraph state models for chat workflow
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ChatState(BaseModel):
    """State for LangGraph chat workflow"""
    text: str = Field(..., description="User input text")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Chat history")
    resume: Dict[str, Any] = Field(..., description="Current resume data")
    latest_suggestion: Optional[Dict[str, Any]] = Field(None, description="Latest generated suggestion")
    response: Optional[str] = Field(None, description="AI response text")
    finalized: bool = Field(False, description="Whether the suggestion is finalized")
    intent: Optional[str] = Field(None, description="User intent (request_suggestion, confirm_suggestion, reject_suggestion, chat)") 