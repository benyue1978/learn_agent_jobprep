import logging
import json
from typing import Dict, Any, List
from src.models.resume import ChatRequest, ChatResponse, ChatMessage
from src.llm.client import llm_client
from src.llm.prompts import CHAT_PROMPT

logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat interactions with AI"""
    
    def __init__(self):
        self.llm_client = llm_client
    
    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Process chat request and generate AI response
        
        Args:
            request: ChatRequest containing messages and context
            
        Returns:
            ChatResponse with AI reply and suggested actions
        """
        try:
            logger.info("Processing chat request")
            
            # Extract the latest user message
            user_message = ""
            for message in reversed(request.messages):
                if message.role == "user":
                    user_message = message.content
                    break
            
            if not user_message:
                raise ValueError("No user message found in chat history")
            
            # For now, return a mock response since LLM client is simplified
            # In production, this would call the LLM with proper prompt formatting
            if "分析" in user_message or "改进" in user_message:
                reply = "我理解您想要改进简历。基于您提供的信息，我建议在以下几个方面进行优化：\n\n1. 在工作经历中添加更多量化成果\n2. 补充最新的技术技能\n3. 优化项目描述的表述方式\n\n您希望我帮您具体改进哪个部分？"
                action = {
                    "type": "suggest_update",
                    "field": "work[0]",
                    "suggested": "负责电商平台后端开发，通过微服务架构优化，提升系统响应速度30%，支持日活用户100万+"
                }
            else:
                reply = "您好！我是您的简历优化助手。我可以帮您分析简历、提供改进建议，并协助您完善各个部分。请告诉我您需要什么帮助？"
                action = None
            
            logger.info("Chat response generated successfully")
            
            return ChatResponse(
                reply=reply,
                action=action
            )
            
        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            raise
    
    def _format_resume_context(self, resume_data: Dict[str, Any]) -> str:
        """Format resume data for context"""
        if not resume_data:
            return "无简历信息"
        
        try:
            # Format basic info
            basics = resume_data.get("basics", {})
            context = f"姓名: {basics.get('name', 'N/A')}\n"
            context += f"邮箱: {basics.get('email', 'N/A')}\n"
            context += f"电话: {basics.get('phone', 'N/A')}\n"
            context += f"地点: {basics.get('location', 'N/A')}\n"
            context += f"简介: {basics.get('summary', 'N/A')}\n\n"
            
            # Format education
            education = resume_data.get("education", [])
            if education:
                context += "教育经历:\n"
                for i, edu in enumerate(education):
                    context += f"  {i+1}. {edu.get('institution', 'N/A')} - {edu.get('degree', 'N/A')}\n"
                    context += f"     专业: {edu.get('field_of_study', 'N/A')}\n"
                    context += f"     时间: {edu.get('start_date', 'N/A')} - {edu.get('end_date', 'N/A')}\n"
                    if edu.get('gpa'):
                        context += f"     GPA: {edu.get('gpa')}\n"
                context += "\n"
            
            # Format work experience
            work = resume_data.get("work", [])
            if work:
                context += "工作经历:\n"
                for i, job in enumerate(work):
                    context += f"  {i+1}. {job.get('company', 'N/A')} - {job.get('position', 'N/A')}\n"
                    context += f"     时间: {job.get('start_date', 'N/A')} - {job.get('end_date', 'N/A')}\n"
                    context += f"     描述: {job.get('description', 'N/A')}\n"
                    achievements = job.get('achievements', [])
                    if achievements:
                        context += "     成就:\n"
                        for achievement in achievements:
                            context += f"       - {achievement}\n"
                context += "\n"
            
            # Format skills
            skills = resume_data.get("skills", [])
            if skills:
                context += "技能:\n"
                for skill in skills:
                    context += f"  - {skill.get('name', 'N/A')} ({skill.get('level', 'N/A')})\n"
                context += "\n"
            
            return context
            
        except Exception as e:
            logger.error(f"Error formatting resume context: {str(e)}")
            return "简历信息格式错误"
    
    def _format_chat_history(self, messages: List[ChatMessage]) -> str:
        """Format chat history for context"""
        if not messages:
            return "无对话历史"
        
        try:
            history = ""
            for message in messages[-5:]:  # Only include last 5 messages
                role = "用户" if message.role == "user" else "助手"
                history += f"{role}: {message.content}\n"
            
            return history
            
        except Exception as e:
            logger.error(f"Error formatting chat history: {str(e)}")
            return "对话历史格式错误"


# Global service instance
chat_service = ChatService() 