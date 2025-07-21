from fastapi import APIRouter, HTTPException
from src.models.resume import (
    ParseResumeRequest, ParseResumeResponse,
    AcceptSuggestionRequest, AcceptSuggestionResponse,
    SaveResumeRequest, SaveResumeResponse
)
# from src.langgraph.parse_resume.workflow import resume_workflow  # TODO: 待实现
from src.services.resume_service import resume_service

router = APIRouter(tags=["resume"])

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
        result = await resume_service.parse_resume(request.text)
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


@router.post("/resume", response_model=SaveResumeResponse)
async def save_resume(request: SaveResumeRequest):
    """
    Save a complete resume object to backend memory (overwrites existing resume)
    """
    try:
        # Validate the resume object using Pydantic validation
        # The Resume model will automatically validate the structure
        validated_resume = request.resume
        
        # Store the resume in memory (overwrites existing)
        resume_storage["current"] = validated_resume
        
        return SaveResumeResponse(status="ok")
    except ValueError as e:
        # Handle validation errors from Pydantic
        raise HTTPException(status_code=400, detail=f"Invalid resume structure: {str(e)}")
    except Exception as e:
        # Handle other errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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