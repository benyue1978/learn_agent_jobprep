import pytest
import asyncio
from src.services.chat_service import chat_service
from src.models.chat import ChatRequest, ChatResponse, ChatMessage


class TestChatService:
    """Test cases for chat service functionality"""
    
    def test_format_resume_context_empty(self):
        """Test formatting empty resume context"""
        result = chat_service._format_resume_context({})
        assert "无简历信息" in result
    
    def test_format_resume_context_with_data(self):
        """Test formatting resume context with data"""
        resume_data = {
            "basics": {
                "name": "张三",
                "email": "zhangsan@example.com",
                "phone": "13800138000",
                "location": "北京",
                "summary": "软件工程师"
            },
            "education": [
                {
                    "institution": "清华大学",
                    "degree": "计算机科学学士",
                    "field_of_study": "计算机科学与技术",
                    "start_date": "2018-09",
                    "end_date": "2022-07",
                    "gpa": "3.8/4.0"
                }
            ],
            "work": [
                {
                    "company": "阿里巴巴",
                    "position": "高级软件工程师",
                    "start_date": "2022-08",
                    "end_date": "2024-12",
                    "description": "负责电商平台后端开发",
                    "achievements": ["优化系统性能", "设计微服务架构"]
                }
            ],
            "skills": [
                {"name": "Python", "level": "高级", "category": "编程语言"},
                {"name": "Java", "level": "中级", "category": "编程语言"}
            ]
        }
        
        result = chat_service._format_resume_context(resume_data)
        
        # Check that all sections are present
        assert "姓名: 张三" in result
        assert "邮箱: zhangsan@example.com" in result
        assert "教育经历:" in result
        assert "清华大学" in result
        assert "工作经历:" in result
        assert "阿里巴巴" in result
        assert "技能:" in result
        assert "Python" in result
    
    def test_format_chat_history_empty(self):
        """Test formatting empty chat history"""
        result = chat_service._format_chat_history([])
        assert "无对话历史" in result
    
    def test_format_chat_history_with_messages(self):
        """Test formatting chat history with messages"""
        messages = [
            ChatMessage(role="user", content="你好"),
            ChatMessage(role="assistant", content="您好！有什么可以帮助您的吗？"),
            ChatMessage(role="user", content="帮我分析简历")
        ]
        
        result = chat_service._format_chat_history(messages)
        
        assert "用户: 你好" in result
        assert "助手: 您好！有什么可以帮助您的吗？" in result
        assert "用户: 帮我分析简历" in result
    
    def test_format_chat_history_limit(self):
        """Test that chat history is limited to last 5 messages"""
        messages = [
            ChatMessage(role="user", content=f"消息{i}") 
            for i in range(10)
        ]
        
        result = chat_service._format_chat_history(messages)
        
        # Should only contain last 5 messages
        assert "消息5" in result
        assert "消息6" in result
        assert "消息7" in result
        assert "消息8" in result
        assert "消息9" in result
        assert "消息0" not in result  # Should not contain first message
    
    @pytest.mark.asyncio
    async def test_process_chat_success(self):
        """Test successful chat processing"""
        request = ChatRequest(
            messages=[
                ChatMessage(role="user", content="你好，请帮我分析一下我的简历")
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
        
        response = await chat_service.process_chat(request)
        
        assert response.reply is not None
        assert len(response.reply) > 0
        # Should contain improvement suggestions since message contains "分析"
        assert "改进" in response.reply or "优化" in response.reply
    
    @pytest.mark.asyncio
    async def test_process_chat_general_greeting(self):
        """Test chat processing with general greeting"""
        request = ChatRequest(
            messages=[
                ChatMessage(role="user", content="你好")
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
        
        response = await chat_service.process_chat(request)
        
        assert response.reply is not None
        assert len(response.reply) > 0
        # Should be a general greeting response
        assert "您好" in response.reply or "助手" in response.reply
    
    @pytest.mark.asyncio
    async def test_process_chat_no_user_message(self):
        """Test chat processing with no user message"""
        request = ChatRequest(
            messages=[
                ChatMessage(role="assistant", content="Hello")
            ],
            context={}
        )
        
        with pytest.raises(ValueError, match="No user message found"):
            await chat_service.process_chat(request)
    
    @pytest.mark.asyncio
    async def test_process_chat_with_action(self):
        """Test chat processing that returns an action"""
        request = ChatRequest(
            messages=[
                ChatMessage(role="user", content="帮我改进工作经历")
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
        
        response = await chat_service.process_chat(request)
        
        assert response.reply is not None
        assert response.action is not None
        assert response.action["type"] == "suggest_update"
        assert "field" in response.action
        assert "suggested" in response.action 