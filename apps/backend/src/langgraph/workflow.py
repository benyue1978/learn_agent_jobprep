from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
import json
import re

from src.models.resume import (
    LangGraphState, Resume, Suggestion, ParseResumeResponse,
    ValidationResult, SuggestionValidationResult
)
from src.llm.client import llm_client


class ResumeParsingWorkflow:
    """LangGraph workflow for resume parsing"""
    
    def __init__(self):
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(LangGraphState)
        
        # Add nodes
        workflow.add_node("parse_resume", self._parse_resume_node)
        workflow.add_node("validate_resume", self._validate_resume_node)
        workflow.add_node("generate_suggestions", self._generate_suggestions_node)
        workflow.add_node("validate_suggestions", self._validate_suggestions_node)
        workflow.add_node("combine_result", self._combine_result_node)
        workflow.add_node("handle_resume_error", self._handle_resume_error_node)
        workflow.add_node("handle_suggestion_error", self._handle_suggestion_error_node)
        
        # Add edges
        workflow.set_entry_point("parse_resume")
        workflow.add_edge("parse_resume", "validate_resume")
        workflow.add_conditional_edges(
            "validate_resume",
            self._should_continue_after_resume_validation,
            {
                "continue": "generate_suggestions",
                "error": "handle_resume_error"
            }
        )
        workflow.add_edge("generate_suggestions", "validate_suggestions")
        workflow.add_conditional_edges(
            "validate_suggestions",
            self._should_continue_after_suggestion_validation,
            {
                "continue": "combine_result",
                "error": "handle_suggestion_error"
            }
        )
        workflow.add_edge("combine_result", END)
        workflow.add_edge("handle_resume_error", END)
        workflow.add_edge("handle_suggestion_error", END)
        
        return workflow.compile()
    
    async def _parse_resume_node(self, state: LangGraphState) -> LangGraphState:
        """Parse resume text using LLM"""
        try:
            # Use LLM to parse resume
            response = await llm_client.parse_resume(state.resume_text)
            
            # Parse the JSON response
            resume_data = json.loads(response)
            parsed_resume = Resume(**resume_data)
            
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=parsed_resume,
                suggestions=state.suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        except Exception as e:
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message=f"Failed to parse resume: {str(e)}"
            )
    
    async def _validate_resume_node(self, state: LangGraphState) -> LangGraphState:
        """Validate parsed resume structure"""
        errors = []
        
        if not state.parsed_resume:
            errors.append("No resume data parsed")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        
        resume = state.parsed_resume
        
        # Validate basic info
        if not resume.basics.name or not resume.basics.email:
            errors.append("Missing required basic info: name and email")
        
        # Validate education (at least one)
        if not resume.education:
            errors.append("At least one education entry is required")
        
        # Validate work experience (at least one)
        if not resume.work:
            errors.append("At least one work experience entry is required")
        
        # Validate required fields in education
        for i, edu in enumerate(resume.education):
            if not edu.institution or not edu.degree or not edu.field_of_study:
                errors.append(f"Education {i+1}: Missing required fields (institution, degree, field_of_study)")
            if not edu.start_date:
                errors.append(f"Education {i+1}: Missing start date")
        
        # Validate required fields in work experience
        for i, work in enumerate(resume.work):
            if not work.company or not work.position or not work.description:
                errors.append(f"Work experience {i+1}: Missing required fields (company, position, description)")
            if not work.start_date:
                errors.append(f"Work experience {i+1}: Missing start date")
        
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=state.suggestions,
            validation_errors=errors,
            final_result=state.final_result,
            error_message=state.error_message
        )
    
    async def _generate_suggestions_node(self, state: LangGraphState) -> LangGraphState:
        """Generate optimization suggestions based on parsed resume"""
        try:
            if not state.parsed_resume:
                return LangGraphState(
                    resume_text=state.resume_text,
                    parsed_resume=state.parsed_resume,
                    suggestions=state.suggestions,
                    validation_errors=state.validation_errors,
                    final_result=state.final_result,
                    error_message="No resume data available for suggestions"
                )
            
            # Convert resume to dict for LLM processing
            resume_dict = state.parsed_resume.model_dump()
            
            # Generate suggestions using LLM
            suggestions_text = await llm_client.generate_suggestions(resume_dict)
            
            # Parse suggestions (assuming JSON format)
            suggestions_data = json.loads(suggestions_text)
            suggestions = [Suggestion(**s) for s in suggestions_data]
            
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        except Exception as e:
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message=f"Failed to generate suggestions: {str(e)}"
            )
    
    async def _validate_suggestions_node(self, state: LangGraphState) -> LangGraphState:
        """Validate that suggestions reference valid resume fields"""
        errors = []
        valid_suggestions = []
        
        if not state.parsed_resume or not state.suggestions:
            errors.append("No resume or suggestions data available for validation")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        
        resume = state.parsed_resume
        
        for suggestion in state.suggestions:
            # Validate field path exists in resume
            if not self._validate_field_path(suggestion.field, resume):
                errors.append(f"Suggestion references invalid field: {suggestion.field}")
            else:
                valid_suggestions.append(suggestion)
        
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=valid_suggestions,
            validation_errors=errors,
            final_result=state.final_result,
            error_message=state.error_message
        )
    
    def _validate_field_path(self, field_path: str, resume: Resume) -> bool:
        """Validate if a field path exists in the resume"""
        try:
            # Parse field path
            path_parts = self._parse_field_path(field_path)
            
            # Navigate through the resume object
            current = resume
            for part in path_parts:
                if isinstance(part, int):
                    # Array access
                    if not isinstance(current, list) or part >= len(current):
                        return False
                    current = current[part]
                else:
                    # Object property access
                    if not hasattr(current, part):
                        return False
                    current = getattr(current, part)
            
            return True
        except Exception:
            return False
    
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
                        return []  # Invalid index
                else:
                    return []  # Missing closing bracket
            else:
                current += char
            
            i += 1
        
        if current:
            parts.append(current)
        
        return parts
    
    async def _combine_result_node(self, state: LangGraphState) -> LangGraphState:
        """Combine resume and suggestions into final result"""
        if not state.parsed_resume:
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message="No resume data available for final result"
            )
        
        final_result = ParseResumeResponse(
            resume=state.parsed_resume,
            suggestions=state.suggestions
        )
        
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=state.suggestions,
            validation_errors=state.validation_errors,
            final_result=final_result,
            error_message=state.error_message
        )
    
    async def _handle_resume_error_node(self, state: LangGraphState) -> LangGraphState:
        """Handle resume validation errors"""
        error_msg = "Resume structure validation failed:\n" + "\n".join(state.validation_errors)
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=state.suggestions,
            validation_errors=state.validation_errors,
            final_result=state.final_result,
            error_message=error_msg
        )
    
    async def _handle_suggestion_error_node(self, state: LangGraphState) -> LangGraphState:
        """Handle suggestion validation errors"""
        error_msg = "Suggestion validation failed:\n" + "\n".join(state.validation_errors)
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=state.suggestions,
            validation_errors=state.validation_errors,
            final_result=state.final_result,
            error_message=error_msg
        )
    
    def _should_continue_after_resume_validation(self, state: LangGraphState) -> str:
        """Determine next step after resume validation"""
        if state.validation_errors:
            return "error"
        return "continue"
    
    def _should_continue_after_suggestion_validation(self, state: LangGraphState) -> str:
        """Determine next step after suggestion validation"""
        if state.validation_errors:
            return "error"
        return "continue"
    
    async def run(self, resume_text: str) -> ParseResumeResponse:
        """Run the complete workflow"""
        initial_state = LangGraphState(resume_text=resume_text)
        
        # Execute the workflow
        final_state_dict = await self.graph.ainvoke(initial_state)
        
        # Convert dict back to LangGraphState
        final_state = LangGraphState(**final_state_dict)
        
        if final_state.error_message:
            raise ValueError(final_state.error_message)
        
        if not final_state.final_result:
            raise ValueError("Workflow completed but no result generated")
        
        return final_state.final_result


# Global workflow instance
resume_workflow = ResumeParsingWorkflow() 