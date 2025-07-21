"""
Integration tests for chat API endpoints
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from src.main import app
from src.models.chat import ChatRequest, ChatResponse

client = TestClient(app)


class TestChatAPI:
    """Test cases for chat API endpoints"""
    
    @pytest.fixture
    def sample_resume(self):
        """Sample resume data for testing"""
        return {
            "basics": {
                "name": "张三",
                "email": "zhangsan@example.com",
                "phone": "13800138000",
                "location": "北京",
                "summary": "经验丰富的软件工程师"
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
                    "achievements": [
                        "优化系统性能，提升响应速度30%",
                        "设计并实现微服务架构"
                    ]
                }
            ],
            "skills": [
                {
                    "name": "Java",
                    "level": "高级",
                    "category": "编程语言"
                }
            ],
            "certificates": []
        }
    
    @pytest.fixture
    def sample_history(self):
        """Sample chat history for testing"""
        return [
            {"role": "user", "content": "你好"},
            {"role": "assistant", "content": "您好！我是您的简历优化助手。"}
        ]
    
    def test_chat_request_suggestion(self, sample_resume, sample_history):
        """Test chat endpoint for suggestion request"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="我已经为您生成了简历改进建议",
                action={
                    "field": "work[0].description",
                    "current": "负责电商平台后端开发",
                    "suggested": "负责阿里巴巴电商平台后端开发，处理高并发订单系统",
                    "reason": "添加具体公司名称和更详细的技术描述"
                }
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "请帮我改进简历"},
                    {"role": "assistant", "content": "好的，我来帮您分析简历"},
                    {"role": "user", "content": "请改进工作经历描述"}
                ],
                "context": {
                    "resume": sample_resume
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            assert "action" in data
            mock_run.assert_called_once()
    
    def test_chat_confirm_suggestion(self, sample_resume, sample_history):
        """Test chat endpoint for suggestion confirmation"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="好的，我已经确认了您的建议",
                action=None
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "请帮我改进简历"},
                    {"role": "assistant", "content": "我建议改进工作描述"},
                    {"role": "user", "content": "好的，我同意这个建议"}
                ],
                "context": {
                    "resume": sample_resume
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            mock_run.assert_called_once()
    
    def test_chat_reject_suggestion(self, sample_resume, sample_history):
        """Test chat endpoint for suggestion rejection"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="好的，我已经拒绝了之前的建议",
                action=None
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "请帮我改进简历"},
                    {"role": "assistant", "content": "我建议改进工作描述"},
                    {"role": "user", "content": "我不喜欢这个建议"}
                ],
                "context": {
                    "resume": sample_resume
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            mock_run.assert_called_once()
    
    def test_chat_general_chat(self, sample_resume, sample_history):
        """Test chat endpoint for general chat"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="您好！我是您的简历优化助手，有什么可以帮助您的吗？",
                action=None
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "你好，请介绍一下自己"}
                ],
                "context": {
                    "resume": sample_resume
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            mock_run.assert_called_once()
    
    def test_chat_missing_messages(self, sample_resume):
        """Test chat endpoint with missing messages field"""
        request_data = {
            "context": {
                "resume": sample_resume
            }
        }
        
        response = client.post("/api/chat", json=request_data)
        
        assert response.status_code == 422
    
    def test_chat_missing_context(self):
        """Test chat endpoint with missing context field"""
        request_data = {
            "messages": [
                {"role": "user", "content": "请帮我改进简历"}
            ]
        }
        
        response = client.post("/api/chat", json=request_data)
        
        assert response.status_code == 200  # context 是可选字段
    
    def test_chat_workflow_error(self, sample_resume, sample_history):
        """Test chat endpoint when workflow fails"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            mock_run.side_effect = Exception("Workflow error")
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "请帮我改进简历"}
                ],
                "context": {
                    "resume": sample_resume
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 500
            mock_run.assert_called_once()
    
    def test_chat_empty_messages(self, sample_resume):
        """Test chat endpoint with empty messages"""
        request_data = {
            "messages": [],
            "context": {
                "resume": sample_resume
            }
        }
        
        response = client.post("/api/chat", json=request_data)
        
        # Empty messages should be rejected by model validation
        assert response.status_code == 422
    
    def test_chat_empty_resume(self):
        """Test chat endpoint with empty resume"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="您好！我是您的简历优化助手。",
                action=None
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "你好"}
                ],
                "context": {
                    "resume": {}
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            mock_run.assert_called_once()
    
    def test_chat_simple_request(self):
        """Test simple chat request"""
        with patch('src.services.chat_service.chat_service.process_chat', new_callable=AsyncMock) as mock_run:
            from src.models.chat import ChatResponse
            mock_run.return_value = ChatResponse(
                reply="您好！我是您的简历优化助手。",
                action=None
            )
            
            request_data = {
                "messages": [
                    {"role": "user", "content": "你好"}
                ],
                "context": {
                    "resume": {
                        "basics": {
                            "name": "测试用户",
                            "email": "test@example.com"
                        }
                    }
                }
            }
            
            response = client.post("/api/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "reply" in data
            mock_run.assert_called_once() 