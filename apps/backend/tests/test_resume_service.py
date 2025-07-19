import pytest
import asyncio
from src.services.resume_service import resume_service
from src.models.resume import Resume, BasicInfo, Education, WorkExperience, Skill


class TestResumeService:
    """Test cases for resume service functionality"""
    
    def test_parse_field_path(self):
        """Test field path parsing"""
        # This is already tested in test_field_parsing.py
        # Just a quick sanity check
        result = resume_service._parse_field_path("work[0].description")
        assert result == ["work", 0, "description"]
    
    def test_update_resume_field_simple(self):
        """Test updating simple fields in resume"""
        # Create a test resume with required fields
        resume = Resume(
            basics=BasicInfo(
                name="测试用户",
                email="test@example.com"
            ),
            education=[
                Education(
                    institution="测试大学",
                    degree="学士",
                    field_of_study="计算机科学",
                    start_date="2018-09"
                )
            ],
            work=[
                WorkExperience(
                    company="测试公司",
                    position="软件工程师",
                    description="原始描述",
                    start_date="2022-08"
                )
            ],
            skills=[],
            certificates=[]
        )
        
        # Test updating basics.name
        updated_resume = resume_service._update_resume_field(
            resume, 
            ["basics", "name"], 
            "新名字"
        )
        
        assert updated_resume.basics.name == "新名字"
        assert updated_resume.basics.email == "test@example.com"  # Should remain unchanged
    
    def test_update_resume_field_array(self):
        """Test updating fields in array elements"""
        # Create a test resume with work experience
        resume = Resume(
            basics=BasicInfo(
                name="测试用户",
                email="test@example.com"
            ),
            education=[
                Education(
                    institution="测试大学",
                    degree="学士",
                    field_of_study="计算机科学",
                    start_date="2018-09"
                )
            ],
            work=[
                WorkExperience(
                    company="测试公司",
                    position="软件工程师",
                    description="原始描述",
                    start_date="2022-08"
                )
            ],
            skills=[],
            certificates=[]
        )
        
        # Test updating work[0].description
        updated_resume = resume_service._update_resume_field(
            resume, 
            ["work", 0, "description"], 
            "更新后的描述"
        )
        
        assert updated_resume.work[0].description == "更新后的描述"
        assert updated_resume.work[0].company == "测试公司"  # Should remain unchanged
    
    def test_update_resume_field_invalid_path(self):
        """Test updating with invalid field path"""
        resume = Resume(
            basics=BasicInfo(
                name="测试用户",
                email="test@example.com"
            ),
            education=[
                Education(
                    institution="测试大学",
                    degree="学士",
                    field_of_study="计算机科学",
                    start_date="2018-09"
                )
            ],
            work=[
                WorkExperience(
                    company="测试公司",
                    position="软件工程师",
                    description="原始描述",
                    start_date="2022-08"
                )
            ],
            skills=[],
            certificates=[]
        )
        
        # Test with non-existent field
        with pytest.raises(KeyError):
            resume_service._update_resume_field(
                resume, 
                ["nonexistent", "field"], 
                "新值"
            )
    
    def test_update_resume_field_array_index_error(self):
        """Test updating with invalid array index"""
        resume = Resume(
            basics=BasicInfo(
                name="测试用户",
                email="test@example.com"
            ),
            education=[
                Education(
                    institution="测试大学",
                    degree="学士",
                    field_of_study="计算机科学",
                    start_date="2018-09"
                )
            ],
            work=[
                WorkExperience(
                    company="测试公司",
                    position="软件工程师",
                    description="原始描述",
                    start_date="2022-08"
                )
            ],
            skills=[],
            certificates=[]
        )
        
        # Test with array index that doesn't exist
        with pytest.raises(IndexError):
            resume_service._update_resume_field(
                resume, 
                ["work", 1, "description"], 
                "新值"
            )
    
    @pytest.mark.asyncio
    async def test_parse_resume_success(self):
        """Test successful resume parsing"""
        test_text = "张三\n邮箱: test@example.com"
        
        result = await resume_service.parse_resume(test_text)
        
        assert result.resume.basics.name == "张三"
        assert result.resume.basics.email == "zhangsan@example.com"
        assert len(result.resume.work) > 0
        assert len(result.suggestions) > 0
    
    @pytest.mark.asyncio
    async def test_parse_resume_empty_text(self):
        """Test parsing empty resume text"""
        # Empty text should still work with mock LLM
        result = await resume_service.parse_resume("")
        
        # Should return mock data even for empty text
        assert result.resume.basics.name == "张三"
        assert len(result.resume.work) > 0
    
    @pytest.mark.asyncio
    async def test_accept_suggestion_success(self):
        """Test successful suggestion acceptance"""
        # First parse a resume
        test_text = "张三\n邮箱: test@example.com"
        parse_result = await resume_service.parse_resume(test_text)
        
        # Then accept a suggestion
        updated_resume = await resume_service.accept_suggestion(
            "work[0].description",
            "负责AI平台开发，提升自动化率30%",
            parse_result.resume
        )
        
        assert updated_resume.work[0].description == "负责AI平台开发，提升自动化率30%"
    
    @pytest.mark.asyncio
    async def test_accept_suggestion_invalid_field(self):
        """Test accepting suggestion with invalid field"""
        # First parse a resume
        test_text = "张三\n邮箱: test@example.com"
        parse_result = await resume_service.parse_resume(test_text)
        
        # Then try to accept suggestion with invalid field
        with pytest.raises(Exception):
            await resume_service.accept_suggestion(
                "nonexistent[0].field",
                "新值",
                parse_result.resume
            ) 