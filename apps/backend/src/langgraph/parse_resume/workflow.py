import json
import logging
from typing import List, Dict, Any

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from src.models.resume import (
    Resume, ParseResumeResponse, LangGraphState, Suggestion
)
from src.llm.client import llm_client

# Set up logging
logger = logging.getLogger(__name__)

class ResumeParsingWorkflow:
    """LangGraph workflow for resume parsing"""
    
    def __init__(self):
        """Initialize the workflow"""
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        logger.info("Building LangGraph workflow")
        
        # Create the state graph
        workflow = StateGraph(LangGraphState)
        
        # Add nodes
        workflow.add_node("parse_resume", self._parse_resume_node)
        workflow.add_node("validate_resume", self._validate_resume_node)
        workflow.add_node("validate_suggestions", self._validate_suggestions_node)
        workflow.add_node("combine_result", self._combine_result_node)
        workflow.add_node("handle_resume_error", self._handle_resume_error_node)
        workflow.add_node("handle_suggestion_error", self._handle_suggestion_error_node)
        
        # Set entry point
        workflow.set_entry_point("parse_resume")
        
        # Add conditional edges
        workflow.add_conditional_edges(
            "parse_resume",
            self._should_continue_after_resume_validation,
            {
                "continue": "validate_resume",
                "error": "handle_resume_error"
            }
        )
        
        workflow.add_conditional_edges(
            "validate_resume",
            self._should_continue_after_resume_validation,
            {
                "continue": "validate_suggestions",
                "error": "handle_resume_error"
            }
        )
        
        workflow.add_conditional_edges(
            "validate_suggestions",
            self._should_continue_after_suggestion_validation,
            {
                "continue": "combine_result",
                "error": "handle_suggestion_error"
            }
        )
        
        # Add final edges
        workflow.add_edge("combine_result", END)
        workflow.add_edge("handle_resume_error", END)
        workflow.add_edge("handle_suggestion_error", END)
        
        logger.info("LangGraph workflow built successfully")
        return workflow.compile()
    
    async def _parse_resume_node(self, state: LangGraphState) -> LangGraphState:
        """Parse resume text using LLM"""
        logger.info("Starting parse_resume node")
        try:
            # Use LLM to parse resume
            logger.info(f"Calling LLM with resume text: {state.resume_text[:100]}...")
            response = await llm_client.parse_resume(state.resume_text)
            logger.info(f"LLM response received, length: {len(response)}")
            
            # Parse JSON response
            logger.info("Parsing JSON response from LLM")
            try:
                resume_data = json.loads(response)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parsing failed: {e}. Attempting to extract partial JSON...")
                # Try to extract valid JSON from the response
                resume_data = self._extract_partial_json(response)
                if not resume_data:
                    raise ValueError(f"Failed to parse JSON response: {e}")
            
            logger.info(f"JSON parsed successfully. Resume data keys: {list(resume_data.keys())}")
            
            # Extract suggestions from embedded fields to separate array
            # This maintains the original design: resume (pure data) + suggestions (separate array)
            all_suggestions = []
            
            if "basics" in resume_data and "suggestions" in resume_data["basics"]:
                logger.info(f"Found {len(resume_data['basics']['suggestions'])} suggestions in basics")
                all_suggestions.extend(resume_data["basics"]["suggestions"])
                del resume_data["basics"]["suggestions"]
            
            if "education" in resume_data:
                for i, edu in enumerate(resume_data["education"]):
                    if "suggestions" in edu:
                        logger.info(f"Found {len(edu['suggestions'])} suggestions in education[{i}]")
                        all_suggestions.extend(edu["suggestions"])
                        del edu["suggestions"]
            
            if "work" in resume_data:
                for i, work in enumerate(resume_data["work"]):
                    if "suggestions" in work:
                        logger.info(f"Found {len(work['suggestions'])} suggestions in work[{i}]")
                        all_suggestions.extend(work["suggestions"])
                        del work["suggestions"]
            
            if "skills" in resume_data:
                for i, skill in enumerate(resume_data["skills"]):
                    if "suggestions" in skill:
                        logger.info(f"Found {len(skill['suggestions'])} suggestions in skills[{i}]")
                        all_suggestions.extend(skill["suggestions"])
                        del skill["suggestions"]
            
            if "certificates" in resume_data:
                for i, cert in enumerate(resume_data["certificates"]):
                    if "suggestions" in cert:
                        logger.info(f"Found {len(cert['suggestions'])} suggestions in certificates[{i}]")
                        all_suggestions.extend(cert["suggestions"])
                        del cert["suggestions"]
            
            logger.info(f"Total suggestions extracted: {len(all_suggestions)}")
            
            # Create Resume object (without suggestions embedded)
            logger.info("Creating Resume object from parsed data")
            parsed_resume = Resume(**resume_data)
            logger.info(f"Resume object created successfully. Education: {len(parsed_resume.education)}, Work: {len(parsed_resume.work)}")
            
            logger.info("Completed parse_resume node")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=parsed_resume,
                suggestions=all_suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        except Exception as e:
            logger.error(f"Error in parse_resume node: {e}")
            # Log the raw response for debugging
            if 'response' in locals():
                logger.error(f"Raw LLM response that caused error: {response}")
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
        logger.info("Starting validate_resume node")
        errors = []
        
        if not state.parsed_resume:
            errors.append("No resume data parsed")
            logger.warning("validate_resume node failed due to missing parsed_resume")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        
        resume = state.parsed_resume
        
        # Validate basic info - only require name and email
        if not resume.basics.name:
            errors.append("Missing required basic info: name")
        if not resume.basics.email:
            errors.append("Missing required basic info: email")
        
        # Validate education (optional, but if present must have institution)
        if resume.education:
            for i, edu in enumerate(resume.education):
                # Check if this education entry has any meaningful data
                has_data = (edu.institution or edu.degree or edu.field_of_study or 
                           edu.start_date or edu.end_date or edu.gpa)
                if has_data and not edu.institution:
                    errors.append(f"Education {i+1}: Missing institution")
                # degree, field_of_study, start_date are optional
        
        # Validate work experience (optional, but if present must have company)
        if resume.work:
            for i, work in enumerate(resume.work):
                # Only validate if there's both position AND description but missing company
                # Allow entries with just position or just description
                has_both_position_and_description = work.position and work.description
                if has_both_position_and_description and not work.company:
                    errors.append(f"Work experience {i+1}: Missing company")
                # position, description, start_date are optional
        
        logger.info("Completed validate_resume node")
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=state.suggestions,
            validation_errors=errors,
            final_result=state.final_result,
            error_message=state.error_message
        )
    
    async def _validate_suggestions_node(self, state: LangGraphState) -> LangGraphState:
        """Validate that suggestions reference valid resume fields"""
        logger.info("Starting validate_suggestions node")
        errors = []
        valid_suggestions = []
        
        if not state.parsed_resume or not state.suggestions:
            errors.append("No resume or suggestions data available for validation")
            logger.warning("validate_suggestions node failed due to missing parsed_resume or suggestions")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=errors,
                final_result=state.final_result,
                error_message=state.error_message
            )
        
        resume = state.parsed_resume
        logger.info(f"Validating {len(state.suggestions)} suggestions")
        
        for i, suggestion in enumerate(state.suggestions):
            logger.info(f"Validating suggestion {i+1}: {suggestion.field}")
            # Validate field path exists in resume
            if not self._validate_field_path(suggestion.field, resume):
                error_msg = f"Suggestion references invalid field: {suggestion.field}"
                errors.append(error_msg)
                logger.warning(f"Suggestion {i+1} failed validation: {error_msg}")
            else:
                valid_suggestions.append(suggestion)
                logger.info(f"Suggestion {i+1} passed validation: {suggestion.field}")
        
        logger.info(f"Validation completed. Valid suggestions: {len(valid_suggestions)}, Invalid: {len(errors)}")
        logger.info("Completed validate_suggestions node")
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
                    if not isinstance(current, list):
                        return False
                    # Check if array is empty or index is out of bounds
                    if len(current) == 0 or part >= len(current):
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
        logger.info("Starting combine_result node")
        if not state.parsed_resume:
            logger.warning("combine_result node failed due to missing parsed_resume")
            return LangGraphState(
                resume_text=state.resume_text,
                parsed_resume=state.parsed_resume,
                suggestions=state.suggestions,
                validation_errors=state.validation_errors,
                final_result=state.final_result,
                error_message="No resume data available for final result"
            )
        
        # Keep suggestions embedded within each object
        # The resume object already has suggestions embedded in each section
        resume = state.parsed_resume
        
        # Create a flat list of all suggestions for the response
        all_suggestions = []
        
        # Collect suggestions from basics
        if resume.basics.suggestions:
            all_suggestions.extend(resume.basics.suggestions)
        
        # Collect suggestions from education
        for edu in resume.education:
            if edu.suggestions:
                all_suggestions.extend(edu.suggestions)
        
        # Collect suggestions from work experience
        for work in resume.work:
            if work.suggestions:
                all_suggestions.extend(work.suggestions)
        
        # Collect suggestions from skills
        for skill in resume.skills:
            if skill.suggestions:
                all_suggestions.extend(skill.suggestions)
        
        # Collect suggestions from certificates
        for cert in resume.certificates:
            if cert.suggestions:
                all_suggestions.extend(cert.suggestions)
        
        # Add any additional suggestions from the workflow state
        all_suggestions.extend(state.suggestions)
        
        final_result = ParseResumeResponse(
            resume=state.parsed_resume,
            suggestions=all_suggestions
        )
        
        logger.info("Completed combine_result node")
        return LangGraphState(
            resume_text=state.resume_text,
            parsed_resume=state.parsed_resume,
            suggestions=all_suggestions,
            validation_errors=state.validation_errors,
            final_result=final_result,
            error_message=state.error_message
        )
    
    async def _handle_resume_error_node(self, state: LangGraphState) -> LangGraphState:
        """Handle resume validation errors"""
        logger.info("Starting handle_resume_error node")
        error_msg = "Resume structure validation failed:\n" + "\n".join(state.validation_errors)
        logger.error(f"handle_resume_error node completed with error: {error_msg}")
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
        logger.info("Starting handle_suggestion_error node")
        error_msg = "Suggestion validation failed:\n" + "\n".join(state.validation_errors)
        logger.error(f"handle_suggestion_error node completed with error: {error_msg}")
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
        logger.info(f"validate_resume node completed. Validation errors: {state.validation_errors}")
        if state.validation_errors:
            logger.warning("validate_resume node failed due to validation errors")
            return "error"
        logger.info("validate_resume node completed successfully")
        return "continue"
    
    def _should_continue_after_suggestion_validation(self, state: LangGraphState) -> str:
        """Determine next step after suggestion validation"""
        logger.info(f"validate_suggestions node completed. Validation errors: {state.validation_errors}")
        if state.validation_errors:
            logger.warning("validate_suggestions node failed due to validation errors")
            return "error"
        logger.info("validate_suggestions node completed successfully")
        return "continue"
    
    async def run(self, resume_text: str) -> ParseResumeResponse:
        """Run the complete workflow"""
        logger.info("Starting workflow run")
        initial_state = LangGraphState(resume_text=resume_text)
        
        # Execute the workflow
        final_state_dict = await self.graph.ainvoke(initial_state)
        
        # Convert dict back to LangGraphState
        final_state = LangGraphState(**final_state_dict)
        
        logger.info(f"Workflow run completed. Final state: {final_state}")
        
        if final_state.error_message:
            logger.error(f"Workflow failed with error: {final_state.error_message}")
            raise ValueError(final_state.error_message)
        
        if not final_state.final_result:
            logger.warning("Workflow completed but no result generated")
            raise ValueError("Workflow completed but no result generated")
        
        return final_state.final_result

    def _extract_partial_json(self, response: str) -> dict:
        """Extract partial valid JSON from truncated response"""
        logger.info("Attempting to extract partial JSON from truncated response")
        
        # Find the last complete object by looking for balanced braces
        brace_count = 0
        last_complete_pos = -1
        
        for i, char in enumerate(response):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    last_complete_pos = i
        
        if last_complete_pos > 0:
            # Extract the complete JSON part
            complete_json = response[:last_complete_pos + 1]
            logger.info(f"Extracted complete JSON ending at position {last_complete_pos}")
            
            try:
                return json.loads(complete_json)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse extracted JSON: {e}")
        
        # If we can't find complete JSON, try to fix common truncation issues
        logger.warning("Could not find complete JSON, attempting to fix common truncation issues")
        
        # Remove incomplete suggestions arrays
        import re
        # Find incomplete suggestions like: "suggestions": [{"field": "skills[18].level", "current": "Proficient", "suggested": "
        pattern = r'"suggestions":\s*\[\s*\{[^}]*"[^"]*"[^}]*$'
        cleaned_response = re.sub(pattern, '"suggestions": []', response)
        
        # Remove incomplete objects at the end
        # Find the last complete object by removing trailing incomplete content
        lines = cleaned_response.split('\n')
        for i in range(len(lines) - 1, -1, -1):
            line = lines[i].strip()
            if line.endswith('{') or line.endswith('[') or not line.endswith(','):
                # This line is incomplete, remove it and everything after
                cleaned_response = '\n'.join(lines[:i])
                break
        
        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            logger.error("Failed to extract any valid JSON")
            return {}


# Global workflow instance
resume_workflow = ResumeParsingWorkflow() 