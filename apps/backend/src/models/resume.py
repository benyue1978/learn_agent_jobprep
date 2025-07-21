from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from enum import Enum

class Suggestion(BaseModel):
    """Suggestion model"""
    field: str = Field(..., description="Field path to update")
    current: str = Field(..., description="Current value")
    suggested: str = Field(..., description="Suggested value")
    reason: str = Field(..., description="Reason for suggestion")

# Resume相关model
class BasicInfo(BaseModel):
    """Basic information model"""
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="Location")
    summary: Optional[str] = Field(None, description="Professional summary")
    suggestions: Optional[List[Suggestion]] = Field(None, description="Optimization suggestions")

class Education(BaseModel):
    """Education experience model"""
    institution: str = Field(..., description="Institution name")
    degree: str = Field(..., description="Degree obtained")
    field_of_study: str = Field(..., description="Field of study")
    start_date: str = Field(..., description="Start date (YYYY-MM)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM)")
    gpa: Optional[str] = Field(None, description="GPA")
    suggestions: Optional[List[Suggestion]] = Field(None, description="Optimization suggestions")

class WorkExperience(BaseModel):
    """Work experience model"""
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job position")
    start_date: str = Field(..., description="Start date (YYYY-MM)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM)")
    description: str = Field(..., description="Job description")
    achievements: Optional[List[str]] = Field(None, description="Key achievements")
    suggestions: Optional[List[Suggestion]] = Field(None, description="Optimization suggestions")

class Skill(BaseModel):
    """Skill model"""
    name: str = Field(..., description="Skill name")
    level: Optional[str] = Field(None, description="Skill level")
    category: Optional[str] = Field(None, description="Skill category")
    suggestions: Optional[List[Suggestion]] = Field(None, description="Optimization suggestions")

class Certificate(BaseModel):
    """Certificate model"""
    name: str = Field(..., description="Certificate name")
    issuer: str = Field(..., description="Issuing organization")
    date: str = Field(..., description="Issue date (YYYY-MM)")
    description: Optional[str] = Field(None, description="Certificate description")
    suggestions: Optional[List[Suggestion]] = Field(None, description="Optimization suggestions")

class Resume(BaseModel):
    """Complete resume model"""
    basics: BasicInfo = Field(..., description="Basic information")
    education: List[Education] = Field(default_factory=list, description="Education history")
    work: List[WorkExperience] = Field(default_factory=list, description="Work experience")
    skills: List[Skill] = Field(default_factory=list, description="Skills")
    certificates: List[Certificate] = Field(default_factory=list, description="Certificates")
    
    @field_validator('education', 'work', 'skills')
    @classmethod
    def validate_non_empty_lists(cls, v, info):
        """Ensure at least one item in required lists"""
        field_name = info.field_name
        if field_name in ['education', 'work'] and len(v) == 0:
            raise ValueError(f"{field_name} must have at least one item")
        return v

# 解析简历相关
class ParseResumeRequest(BaseModel):
    """Parse resume request model"""
    text: str = Field(..., description="Resume text to parse")

class ParseResumeResponse(BaseModel):
    """Parse resume response model"""
    resume: Resume = Field(..., description="Parsed resume")
    suggestions: List[Suggestion] = Field(..., description="Optimization suggestions")

class AcceptSuggestionRequest(BaseModel):
    """Accept suggestion request model"""
    field: str = Field(..., description="Field path to update")
    suggested: str = Field(..., description="New value to set")

class AcceptSuggestionResponse(BaseModel):
    """Accept suggestion response model"""
    resume: Resume = Field(..., description="Updated resume")

class SaveResumeRequest(BaseModel):
    """Save resume request model"""
    resume: Resume = Field(..., description="Resume object to save")

class SaveResumeResponse(BaseModel):
    """Save resume response model"""
    status: str = Field(..., description="Operation status")

# 解析流程相关State
class LangGraphState(BaseModel):
    """State for LangGraph workflow"""
    resume_text: str = Field(..., description="Original resume text")
    parsed_resume: Optional[Resume] = Field(None, description="Parsed resume object")
    suggestions: List[Suggestion] = Field(default_factory=list, description="Generated suggestions")
    validation_errors: List[str] = Field(default_factory=list, description="Validation errors")
    final_result: Optional[ParseResumeResponse] = Field(None, description="Final result")
    error_message: Optional[str] = Field(None, description="Error message if workflow fails")

class ValidationResult(BaseModel):
    """Validation result model"""
    is_valid: bool = Field(..., description="Whether validation passed")
    errors: List[str] = Field(default_factory=list, description="Validation errors")

class SuggestionValidationResult(BaseModel):
    """Suggestion validation result model"""
    is_valid: bool = Field(..., description="Whether validation passed")
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    valid_suggestions: List[Suggestion] = Field(default_factory=list, description="Valid suggestions") 