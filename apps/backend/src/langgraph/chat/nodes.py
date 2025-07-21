"""
LangGraph nodes for chat workflow
"""
import logging
from typing import Dict, Any

from src.models.chat import ChatState
from src.langgraph.chat.tools import (
    format_history, format_resume, extract_intent, 
    get_field_value, is_confirmation, parse_suggestion
)
from src.llm.client import llm_client
from src.llm.prompts import SUGGESTION_PROMPT, CONFIRMATION_PROMPT, CHAT_RESPONSE_PROMPT

logger = logging.getLogger(__name__)


async def router(state: ChatState) -> ChatState:
    """Route user input to appropriate handler"""
    try:
        # Extract intent from user text
        state.intent = extract_intent(state.text)
        logger.info(f"Router determined intent: {state.intent}")
        return state
        
    except Exception as e:
        logger.error(f"Error in router: {str(e)}")
        state.intent = "chat"  # Default to chat
        return state


async def generate_suggestion(state: ChatState) -> ChatState:
    """Generate a suggestion based on user request"""
    try:
        prompt = SUGGESTION_PROMPT.format(
            user_text=state.text,
            history=format_history(state.history),
            resume=format_resume(state.resume)
        )
        
        response = await llm_client.chat_response(prompt)
        
        # Parse suggestion from response
        suggestion = parse_suggestion(response, state.resume)
        if suggestion:
            state.latest_suggestion = suggestion
            state.response = f"我为您生成了一个建议：\n\n**字段**: {suggestion['field']}\n**当前内容**: {suggestion['current']}\n**建议内容**: {suggestion['suggested']}\n**理由**: {suggestion['reason']}\n\n您觉得这个建议如何？"
        else:
            state.response = "抱歉，我无法为您的请求生成具体的建议。请提供更详细的信息或具体说明您想要改进的简历部分。"
        
        return state
        
    except Exception as e:
        logger.error(f"Error generating suggestion: {str(e)}")
        state.response = "生成建议时出现错误，请稍后重试。"
        return state


async def finalize_suggestion(state: ChatState) -> ChatState:
    """Finalize the current suggestion"""
    try:
        if not state.latest_suggestion:
            state.response = "没有可确认的建议。"
            return state
        
        prompt = CONFIRMATION_PROMPT.format(
            user_text=state.text,
            suggestion=state.latest_suggestion,
            resume=format_resume(state.resume)
        )
        
        response = await llm_client.chat_response(prompt)
        
        # Check if user confirmed the suggestion
        if is_confirmation(state.text):
            state.finalized = True
            state.response = f"好的，我已经确认了您的建议。建议内容：{state.latest_suggestion['suggested']}"
        else:
            state.response = "我理解您可能还需要进一步讨论这个建议。请告诉我您的想法。"
        
        return state
        
    except Exception as e:
        logger.error(f"Error finalizing suggestion: {str(e)}")
        state.response = "确认建议时出现错误，请稍后重试。"
        return state


async def reject_suggestion(state: ChatState) -> ChatState:
    """Reject the current suggestion"""
    try:
        if state.latest_suggestion:
            state.latest_suggestion = None
            state.response = "好的，我已经拒绝了之前的建议。请告诉我您希望如何改进简历，我会为您生成新的建议。"
        else:
            state.response = "没有可拒绝的建议。"
        
        return state
        
    except Exception as e:
        logger.error(f"Error rejecting suggestion: {str(e)}")
        state.response = "拒绝建议时出现错误，请稍后重试。"
        return state


async def llm_chat_response(state: ChatState) -> ChatState:
    """Generate a general chat response"""
    try:
        prompt = CHAT_RESPONSE_PROMPT.format(
            user_text=state.text,
            history=format_history(state.history),
            resume=format_resume(state.resume)
        )
        
        response = await llm_client.chat_response(prompt)
        state.response = response
        
        return state
        
    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}")
        state.response = "生成回复时出现错误，请稍后重试。"
        return state


async def update_response(state: ChatState) -> ChatState:
    """Update the final response"""
    # This node ensures the response is properly formatted
    # The actual response is already set in previous nodes
    return state 