import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.routers.resume import resume_storage

client = TestClient(app)


class TestResumeAPI:
    """Test cases for resume API endpoints"""
    
    def setup_method(self):
        """Clear in-memory storage before each test"""
        resume_storage.clear()
    
    def test_parse_resume_success(self):
        """Test successful resume parsing with LangGraph workflow"""
        test_text = """
        张三
        邮箱: test@example.com
        电话: 13800138000
        教育经历:
        - 清华大学 计算机科学学士 2018-2022
        工作经历:
        - 阿里巴巴 高级软件工程师 2022-2024
        """
        
        response = client.post("/api/parse_resume", json={"text": test_text})
        
        assert response.status_code == 200
        data = response.json()
        
        # Check resume structure
        assert "resume" in data
        assert "suggestions" in data
        
        resume = data["resume"]
        assert resume["basics"]["name"] == "张三"
        assert resume["basics"]["email"] == "zhangsan@example.com"
        assert len(resume["education"]) > 0
        assert len(resume["work"]) > 0
        
        # Check suggestions
        suggestions = data["suggestions"]
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        
        # Check suggestion structure
        for suggestion in suggestions:
            assert "field" in suggestion
            assert "current" in suggestion
            assert "suggested" in suggestion
            assert "reason" in suggestion
    
    def test_parse_resume_empty_text(self):
        """Test parsing empty resume text"""
        response = client.post("/api/parse_resume", json={"text": ""})
        
        # Should still work with mock LLM
        assert response.status_code == 200
        data = response.json()
        assert "resume" in data
        assert "suggestions" in data
    
    def test_parse_resume_missing_text(self):
        """Test parsing with missing text field"""
        response = client.post("/api/parse_resume", json={})
        
        assert response.status_code == 422  # Validation error
    
    def test_get_resume_not_found(self):
        """Test getting resume when none exists"""
        response = client.get("/api/resume")
        
        assert response.status_code == 404
        assert "No resume found" in response.json()["detail"]
    
    def test_accept_suggestion_no_resume(self):
        """Test accepting suggestion when no resume exists"""
        request_data = {
            "field": "work[0].description",
            "suggested": "新的工作描述"
        }
        
        response = client.post("/api/accept_suggestion", json=request_data)
        
        assert response.status_code == 404
        assert "No resume found" in response.json()["detail"]
    
    def test_accept_suggestion_invalid_field(self):
        """Test accepting suggestion with invalid field path"""
        # First parse a resume
        test_text = "张三\n邮箱: test@example.com"
        parse_response = client.post("/api/parse_resume", json={"text": test_text})
        assert parse_response.status_code == 200
        
        # Then try to accept invalid suggestion
        request_data = {
            "field": "nonexistent[0].field",
            "suggested": "新值"
        }
        
        response = client.post("/api/accept_suggestion", json=request_data)
        
        assert response.status_code == 400
        # The error message should contain information about the invalid field
        error_detail = response.json()["detail"]
        assert "nonexistent" in error_detail.lower() or "error" in error_detail.lower()


class TestChatAPI:
    """Test cases for chat API endpoints"""
    
    def test_chat_success(self):
        """Test successful chat interaction"""
        request_data = {
            "messages": [
                {"role": "user", "content": "你好，请帮我分析一下我的简历"}
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
        assert len(data["reply"]) > 0
    
    def test_chat_empty_messages(self):
        """Test chat with empty messages"""
        request_data = {
            "messages": [],
            "context": {}
        }
        
        response = client.post("/api/chat", json=request_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_chat_no_user_message(self):
        """Test chat with no user message"""
        request_data = {
            "messages": [
                {"role": "assistant", "content": "Hello"}
            ],
            "context": {}
        }
        
        response = client.post("/api/chat", json=request_data)
        
        # This should be handled by the service layer, not validation
        # The service will raise a ValueError which becomes a 400 error
        assert response.status_code in [400, 422]
        if response.status_code == 400:
            assert "No user message found" in response.json()["detail"]
    
    def test_chat_test_endpoint(self):
        """Test chat test endpoint"""
        response = client.get("/api/chat/test")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "test" in data["message"].lower()


class TestHealthEndpoints:
    """Test cases for health check endpoints"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/healthz")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "jobprep-backend"
    
    def test_test_endpoint(self):
        """Test test endpoint"""
        response = client.get("/test")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "running" in data["message"].lower() 