import pytest
import json
from src.langgraph.parse_resume.workflow import ResumeParsingWorkflow
from src.models.resume import LangGraphState, Resume, Suggestion, BasicInfo, Education, WorkExperience


class TestLangGraphWorkflow:
    """Test cases for LangGraph workflow"""
    
    def setup_method(self):
        """Setup for each test"""
        self.workflow = ResumeParsingWorkflow()
    
    def test_parse_field_path_simple(self):
        """Test parsing simple field paths"""
        test_cases = [
            ("basics.name", ["basics", "name"]),
            ("basics.email", ["basics", "email"]),
            ("work[0].description", ["work", 0, "description"]),
            ("education[1].institution", ["education", 1, "institution"]),
        ]
        
        for field_path, expected in test_cases:
            result = self.workflow._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}"
    
    def test_parse_field_path_complex(self):
        """Test parsing complex field paths"""
        test_cases = [
            ("work[0].achievements[1]", ["work", 0, "achievements", 1]),
            ("education[0].courses[2]", ["education", 0, "courses", 2]),
        ]
        
        for field_path, expected in test_cases:
            result = self.workflow._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}"
    
    def test_validate_field_path_valid(self):
        """Test validating valid field paths"""
        # Create a test resume
        resume = Resume(
            basics={"name": "张三", "email": "test@example.com"},
            education=[
                {"institution": "清华大学", "degree": "学士", "field_of_study": "CS", "start_date": "2018-09"}
            ],
            work=[
                {"company": "阿里巴巴", "position": "工程师", "description": "开发", "start_date": "2022-08"}
            ],
            skills=[],
            certificates=[]
        )
        
        valid_paths = [
            "basics.name",
            "basics.email",
            "education[0].institution",
            "work[0].company",
            "work[0].description"
        ]
        
        for path in valid_paths:
            assert self.workflow._validate_field_path(path, resume), f"Path {path} should be valid"
    
    def test_validate_field_path_invalid(self):
        """Test validating invalid field paths"""
        # Create a valid resume with required fields
        resume = Resume(
            basics=BasicInfo(
                name="张三",
                email="test@example.com"
            ),
            education=[
                Education(
                    institution="清华大学",
                    degree="学士",
                    field_of_study="CS",
                    start_date="2018-09"
                )
            ],
            work=[
                WorkExperience(
                    company="阿里巴巴",
                    position="工程师",
                    description="开发",
                    start_date="2022-08"
                )
            ],
            skills=[],
            certificates=[]
        )
        
        invalid_paths = [
            "nonexistent.field",
            "basics.nonexistent",
            "work[1].description",  # work array only has 1 item (index 0)
            "education[1].institution",  # education array only has 1 item (index 0)
            "work[0].nonexistent"
        ]
        
        for path in invalid_paths:
            assert not self.workflow._validate_field_path(path, resume), f"Path {path} should be invalid"
    
    @pytest.mark.asyncio
    async def test_workflow_success(self):
        """Test successful workflow execution"""
        test_text = "张三\n邮箱: test@example.com\n教育: 清华大学\n工作: 阿里巴巴"
        
        result = await self.workflow.run(test_text)
        
        assert result is not None
        assert result.resume is not None
        assert result.suggestions is not None
        
        # Check resume structure
        assert result.resume.basics.name == "张三"
        assert result.resume.basics.email == "zhangsan@example.com"
        assert len(result.resume.education) > 0
        assert len(result.resume.work) > 0
        
        # Check suggestions
        assert len(result.suggestions) > 0
        for suggestion in result.suggestions:
            assert suggestion.field is not None
            assert suggestion.current is not None
            assert suggestion.suggested is not None
            assert suggestion.reason is not None
    
    @pytest.mark.asyncio
    async def test_workflow_with_invalid_resume(self):
        """Test workflow with invalid resume structure"""
        # This test would require mocking the LLM to return invalid data
        # For now, we test that the workflow handles errors gracefully
        test_text = "invalid resume text"
        
        try:
            result = await self.workflow.run(test_text)
            # If we get here, the mock LLM returned valid data
            assert result is not None
        except ValueError as e:
            # Expected if validation fails
            assert "validation" in str(e).lower() or "error" in str(e).lower()
    
    def test_should_continue_after_resume_validation_valid(self):
        """Test continue decision after valid resume validation"""
        state = LangGraphState(
            resume_text="test",
            validation_errors=[]  # No errors
        )
        
        result = self.workflow._should_continue_after_resume_validation(state)
        assert result == "continue"
    
    def test_should_continue_after_resume_validation_invalid(self):
        """Test error decision after invalid resume validation"""
        state = LangGraphState(
            resume_text="test",
            validation_errors=["Missing name", "Missing email"]  # Has errors
        )
        
        result = self.workflow._should_continue_after_resume_validation(state)
        assert result == "error"
    
    def test_should_continue_after_suggestion_validation_valid(self):
        """Test continue decision after valid suggestion validation"""
        state = LangGraphState(
            resume_text="test",
            validation_errors=[]  # No errors
        )
        
        result = self.workflow._should_continue_after_suggestion_validation(state)
        assert result == "continue"
    
    def test_should_continue_after_suggestion_validation_invalid(self):
        """Test error decision after invalid suggestion validation"""
        state = LangGraphState(
            resume_text="test",
            validation_errors=["Invalid field reference"]  # Has errors
        )
        
        result = self.workflow._should_continue_after_suggestion_validation(state)
        assert result == "error" 