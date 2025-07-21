"""
LangGraph tools for chat workflow
"""
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def format_history(history: List[Dict[str, str]]) -> str:
    """Format chat history for prompts"""
    if not history:
        return "无对话历史"
    
    formatted = ""
    for entry in history[-5:]:  # Last 5 messages
        formatted += f"{entry.get('role', 'user')}: {entry.get('content', '')}\n"
    
    return formatted


def format_resume(resume: Dict[str, Any]) -> str:
    """Format resume data for prompts"""
    if not resume:
        return "无简历信息"
    
    try:
        formatted = ""
        
        # Basic info
        basics = resume.get("basics", {})
        formatted += f"姓名: {basics.get('name', 'N/A')}\n"
        formatted += f"邮箱: {basics.get('email', 'N/A')}\n"
        formatted += f"电话: {basics.get('phone', 'N/A')}\n"
        formatted += f"地点: {basics.get('location', 'N/A')}\n"
        formatted += f"简介: {basics.get('summary', 'N/A')}\n\n"
        
        # Education
        education = resume.get("education", [])
        if education:
            formatted += "教育经历:\n"
            for i, edu in enumerate(education):
                formatted += f"  {i}. {edu.get('institution', 'N/A')} - {edu.get('degree', 'N/A')}\n"
                formatted += f"     专业: {edu.get('field_of_study', 'N/A')}\n"
                formatted += f"     时间: {edu.get('start_date', 'N/A')} - {edu.get('end_date', 'N/A')}\n"
            formatted += "\n"
        
        # Work experience
        work = resume.get("work", [])
        if work:
            formatted += "工作经历:\n"
            for i, job in enumerate(work):
                formatted += f"  {i}. {job.get('company', 'N/A')} - {job.get('position', 'N/A')}\n"
                formatted += f"     时间: {job.get('start_date', 'N/A')} - {job.get('end_date', 'N/A')}\n"
                formatted += f"     描述: {job.get('description', 'N/A')}\n"
            formatted += "\n"
        
        # Skills
        skills = resume.get("skills", [])
        if skills:
            formatted += "技能:\n"
            for skill in skills:
                formatted += f"  - {skill.get('name', 'N/A')} ({skill.get('level', 'N/A')})\n"
            formatted += "\n"
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error formatting resume: {str(e)}")
        return "简历信息格式错误"


def get_field_value(resume: Dict[str, Any], field_path: str) -> Optional[str]:
    """Get field value from resume using field path"""
    try:
        parts = field_path.split('.')
        current = resume
        
        for part in parts:
            if '[' in part and ']' in part:
                # Handle array access
                field_name = part.split('[')[0]
                index = int(part.split('[')[1].split(']')[0])
                current = current.get(field_name, [])
                if isinstance(current, list) and len(current) > index:
                    current = current[index]
                else:
                    return None
            else:
                current = current.get(part, {})
            
            if current is None:
                return None
        
        return str(current) if current else None
        
    except Exception as e:
        logger.error(f"Error getting field value: {str(e)}")
        return None


def extract_intent(text: str) -> str:
    """Extract intent from user text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["建议", "改进", "修改", "优化"]):
        return "request_suggestion"
    elif any(word in text_lower for word in ["确认", "同意", "接受", "好的", "可以"]):
        return "confirm_suggestion"
    elif any(word in text_lower for word in ["拒绝", "不同意", "不要", "算了"]):
        return "reject_suggestion"
    else:
        return "chat"


def is_confirmation(text: str) -> bool:
    """Check if text indicates confirmation"""
    # First check for negative words to avoid false positives
    negative_words = ["不同意", "不要", "拒绝", "算了"]
    text_lower = text.lower()
    if any(word in text_lower for word in negative_words):
        return False
    
    # Then check for positive confirmation words
    confirmation_words = ["确认", "同意", "接受", "好的", "可以", "行", "没问题"]
    return any(word in text_lower for word in confirmation_words)


def parse_suggestion(response: str, resume: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse suggestion from LLM response"""
    try:
        # This is a simplified parser - in production, you'd want more robust parsing
        # For now, we'll create a mock suggestion based on common patterns
        
        # Look for field references in the response
        field = None
        if "education" in response.lower():
            field = "education[0].description"
        elif "work" in response.lower() or "工作" in response:
            field = "work[0].description"
        elif "skills" in response.lower() or "技能" in response:
            field = "skills[0].name"
        else:
            field = "basics.summary"
        
        # Extract current value from resume
        current = get_field_value(resume, field) or "当前内容"
        
        # Generate suggested value
        suggested = f"改进后的{field.split('.')[-1]}内容"
        
        # Extract reason
        reason = "基于您的简历内容和行业最佳实践"
        
        return {
            "field": field,
            "current": current,
            "suggested": suggested,
            "reason": reason
        }
        
    except Exception as e:
        logger.error(f"Error parsing suggestion: {str(e)}")
        return None 