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

    def test_save_resume_success(self):
        """Test successful resume saving"""
        resume_data = {
            "resume": {
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
                    },
                    {
                        "name": "Python",
                        "level": "中级",
                        "category": "编程语言"
                    }
                ],
                "certificates": [
                    {
                        "name": "AWS认证解决方案架构师",
                        "issuer": "Amazon Web Services",
                        "date": "2023-06",
                        "description": "云架构设计和部署认证"
                    }
                ]
            }
        }
        
        response = client.post("/api/resume", json=resume_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        
        # Verify the resume was actually saved
        get_response = client.get("/api/resume")
        assert get_response.status_code == 200
        saved_resume = get_response.json()["resume"]
        assert saved_resume["basics"]["name"] == "张三"
        assert saved_resume["basics"]["email"] == "zhangsan@example.com"
        assert len(saved_resume["education"]) == 1
        assert len(saved_resume["work"]) == 1
        assert len(saved_resume["skills"]) == 2
        assert len(saved_resume["certificates"]) == 1

    def test_save_resume_overwrite_existing(self):
        """Test that saving a resume overwrites the existing one"""
        # First save a resume
        first_resume = {
            "resume": {
                "basics": {
                    "name": "张三",
                    "email": "zhangsan@example.com"
                },
                "education": [
                    {
                        "institution": "清华大学",
                        "degree": "计算机科学学士",
                        "field_of_study": "计算机科学",
                        "start_date": "2018-09",
                        "end_date": "2022-07"
                    }
                ],
                "work": [
                    {
                        "company": "阿里巴巴",
                        "position": "软件工程师",
                        "start_date": "2022-08",
                        "end_date": "2024-12",
                        "description": "后端开发"
                    }
                ]
            }
        }
        
        response1 = client.post("/api/resume", json=first_resume)
        assert response1.status_code == 200
        
        # Then save a different resume
        second_resume = {
            "resume": {
                "basics": {
                    "name": "李四",
                    "email": "lisi@example.com"
                },
                "education": [
                    {
                        "institution": "北京大学",
                        "degree": "软件工程学士",
                        "field_of_study": "软件工程",
                        "start_date": "2019-09",
                        "end_date": "2023-07"
                    }
                ],
                "work": [
                    {
                        "company": "腾讯",
                        "position": "前端工程师",
                        "start_date": "2023-08",
                        "end_date": "2024-12",
                        "description": "前端开发"
                    }
                ]
            }
        }
        
        response2 = client.post("/api/resume", json=second_resume)
        assert response2.status_code == 200
        
        # Verify the second resume overwrote the first
        get_response = client.get("/api/resume")
        assert get_response.status_code == 200
        saved_resume = get_response.json()["resume"]
        assert saved_resume["basics"]["name"] == "李四"
        assert saved_resume["basics"]["email"] == "lisi@example.com"
        assert saved_resume["education"][0]["institution"] == "北京大学"
        assert saved_resume["work"][0]["company"] == "腾讯"

    def test_save_resume_invalid_structure(self):
        """Test saving resume with invalid structure"""
        invalid_resume = {
            "resume": {
                "basics": {
                    "name": "张三"
                    # Missing required email field
                },
                "education": [],  # Empty education list (should fail validation)
                "work": [
                    {
                        "company": "阿里巴巴",
                        "position": "软件工程师",
                        "start_date": "2022-08",
                        "end_date": "2024-12",
                        "description": "后端开发"
                    }
                ]
            }
        }
        
        response = client.post("/api/resume", json=invalid_resume)
        
        # Pydantic validation happens before our code, so we get 422
        assert response.status_code == 422
        error_detail = response.json()["detail"]
        # Check that validation error contains information about missing email
        assert any("email" in str(error).lower() for error in error_detail)

    def test_save_resume_missing_required_fields(self):
        """Test saving resume with missing required fields"""
        incomplete_resume = {
            "resume": {
                "basics": {
                    "name": "张三"
                    # Missing email field
                }
                # Missing education and work fields
            }
        }
        
        response = client.post("/api/resume", json=incomplete_resume)
        
        # Pydantic validation happens before our code, so we get 422
        assert response.status_code == 422
        error_detail = response.json()["detail"]
        # Check that validation error contains information about missing fields
        assert any("email" in str(error).lower() for error in error_detail)

    def test_save_resume_missing_resume_field(self):
        """Test saving resume with missing resume field in request"""
        response = client.post("/api/resume", json={})
        
        assert response.status_code == 422  # Validation error


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