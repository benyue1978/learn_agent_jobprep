from fastapi import APIRouter, HTTPException
from src.models.resume import (
    ParseResumeRequest, ParseResumeResponse,
    AcceptSuggestionRequest, AcceptSuggestionResponse
)
from src.langgraph.workflow import resume_workflow
from src.services.resume_service import resume_service

router = APIRouter(prefix="/api", tags=["resume"])

# In-memory storage for demo purposes
# In production, this should be replaced with a proper database
resume_storage = {}


@router.post("/parse_resume", response_model=ParseResumeResponse)
async def parse_resume(request: ParseResumeRequest):
    """
    Parse resume text using LangGraph workflow
    """
    try:
        # Use LangGraph workflow to parse resume
        result = await resume_workflow.run(request.text)
        
        # Store the parsed resume for later use
        resume_storage["current"] = result.resume
        
        return result
    except ValueError as e:
        # Handle validation errors from LangGraph workflow
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle other errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/resume")
async def get_resume():
    """
    Get the currently stored resume
    """
    if "current" not in resume_storage:
        raise HTTPException(status_code=404, detail="No resume found")
    
    return {"resume": resume_storage["current"]}


@router.post("/accept_suggestion", response_model=AcceptSuggestionResponse)
async def accept_suggestion(request: AcceptSuggestionRequest):
    """
    Accept a suggestion and update the resume
    """
    if "current" not in resume_storage:
        raise HTTPException(status_code=404, detail="No resume found")
    
    try:
        # Use the existing service to update the resume
        updated_resume = await resume_service.accept_suggestion(
            request.field,
            request.suggested,
            resume_storage["current"]
        )
        
        # Update stored resume
        resume_storage["current"] = updated_resume
        
        return AcceptSuggestionResponse(resume=updated_resume)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 