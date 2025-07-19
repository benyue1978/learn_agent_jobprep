import logging
from typing import Dict, Any, List
from src.models.resume import Resume, ParseResumeResponse
from src.langgraph.workflow import resume_workflow

logger = logging.getLogger(__name__)


class ResumeService:
    """Service for resume parsing and management"""
    
    def __init__(self):
        self.llm_client = None  # No longer needed as we use LangGraph workflow
    
    async def parse_resume(self, raw_text: str) -> ParseResumeResponse:
        """
        Parse raw resume text using LangGraph workflow
        
        Args:
            raw_text: Raw resume text content
            
        Returns:
            ParseResumeResponse with structured resume and suggestions
        """
        try:
            logger.info("Starting resume parsing with LangGraph workflow")
            
            # Use LangGraph workflow to parse resume
            result = await resume_workflow.run(raw_text)
            
            logger.info("Resume parsing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            raise
    
    async def accept_suggestion(self, field: str, suggested_value: str, current_resume: Resume) -> Resume:
        """
        Accept a suggestion and update the resume
        
        Args:
            field: Field path to update (e.g., "work[0].description")
            suggested_value: New value for the field
            current_resume: Current resume object
            
        Returns:
            Updated resume object
        """
        try:
            logger.info(f"Accepting suggestion for field: {field}")
            
            # Parse field path
            path_parts = self._parse_field_path(field)
            
            # Update the resume
            updated_resume = self._update_resume_field(current_resume, path_parts, suggested_value)
            
            logger.info(f"Suggestion accepted successfully for field: {field}")
            return updated_resume
            
        except Exception as e:
            logger.error(f"Error accepting suggestion: {str(e)}")
            raise
    
    def _parse_field_path(self, field_path: str) -> List:
        """Parse field path like 'work[0].description' into parts"""
        parts = []
        current = ""
        i = 0
        
        while i < len(field_path):
            char = field_path[i]
            
            if char == '.':
                if current:
                    parts.append(current)
                    current = ""
            elif char == '[':
                if current:
                    parts.append(current)
                    current = ""
                # Find closing bracket
                j = i + 1
                while j < len(field_path) and field_path[j] != ']':
                    j += 1
                if j < len(field_path):
                    index_str = field_path[i+1:j]
                    try:
                        parts.append(int(index_str))
                        i = j
                    except ValueError:
                        raise ValueError(f"Invalid array index: {index_str}")
                else:
                    raise ValueError("Missing closing bracket")
            else:
                current += char
            
            i += 1
        
        if current:
            parts.append(current)
        
        return parts
    
    def _update_resume_field(self, resume: Resume, path_parts: List, new_value: str) -> Resume:
        """Update a field in the resume based on path parts"""
        # Create a copy of the resume
        resume_dict = resume.model_dump()
        
        # Navigate to the target field
        current = resume_dict
        for i, part in enumerate(path_parts[:-1]):
            if isinstance(part, int):
                # Array access
                if not isinstance(current, list) or part >= len(current):
                    raise IndexError(f"Array index {part} out of bounds")
                current = current[part]
            else:
                # Object property access
                if part not in current:
                    raise KeyError(f"Field '{part}' not found")
                current = current[part]
        
        # Update the final field
        final_part = path_parts[-1]
        if isinstance(final_part, int):
            if not isinstance(current, list) or final_part >= len(current):
                raise IndexError(f"Array index {final_part} out of bounds")
            current[final_part] = new_value
        else:
            if final_part not in current:
                raise KeyError(f"Field '{final_part}' not found")
            current[final_part] = new_value
        
        # Create new Resume object from updated dict
        return Resume(**resume_dict)


# Global service instance
resume_service = ResumeService() 