"""
LangGraph Chat Workflow for resume suggestion generation
"""
import logging
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from src.models.chat import ChatState
from src.langgraph.chat.nodes import (
    router, generate_suggestion, finalize_suggestion, 
    reject_suggestion, llm_chat_response, update_response
)

logger = logging.getLogger(__name__)


class ChatWorkflow:
    """LangGraph workflow for managing chat interactions and suggestion generation"""
    
    def __init__(self):
        self.memory = MemorySaver()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(ChatState)
        
        # Add nodes
        workflow.add_node("router", router)
        workflow.add_node("generate_suggestion", generate_suggestion)
        workflow.add_node("finalize_suggestion", finalize_suggestion)
        workflow.add_node("reject_suggestion", reject_suggestion)
        workflow.add_node("llm_chat_response", llm_chat_response)
        workflow.add_node("update_response", update_response)
        
        # Add entry point from START to router
        workflow.set_entry_point("router")
        
        # Add conditional edges from router to other nodes
        workflow.add_conditional_edges(
            "router",
            self._route_condition,
            {
                "request_suggestion": "generate_suggestion",
                "confirm_suggestion": "finalize_suggestion",
                "reject_suggestion": "reject_suggestion",
                "chat": "llm_chat_response"
            }
        )
        
        # Add edges to update_response
        workflow.add_edge("generate_suggestion", "update_response")
        workflow.add_edge("finalize_suggestion", "update_response")
        workflow.add_edge("reject_suggestion", "update_response")
        workflow.add_edge("llm_chat_response", "update_response")
        
        # Add edge to END
        workflow.add_edge("update_response", END)
        
        return workflow.compile()
    
    def _route_condition(self, state: ChatState) -> str:
        """Determine the next node based on intent"""
        intent = state.intent or "chat"
        logger.info(f"Routing to: {intent}")
        return intent
    

    

    

    
    async def run(self, text: str, history: List[Dict[str, str]], resume: Dict[str, Any]) -> Dict[str, Any]:
        """Run the chat workflow"""
        try:
            # Initialize state
            state = ChatState(
                text=text,
                history=history,
                resume=resume
            )
            
            # Run workflow
            result = await self.graph.ainvoke(state)
            
            # Return formatted response
            return {
                "response": result.get("response") or "抱歉，我无法生成回复。",
                "suggestion": result.get("latest_suggestion"),
                "finalized": result.get("finalized", False)
            }
            
        except Exception as e:
            logger.error(f"Error running chat workflow: {str(e)}")
            return {
                "response": "处理您的请求时出现错误，请稍后重试。",
                "suggestion": None,
                "finalized": False
            }


# Global workflow instance
chat_workflow = ChatWorkflow() 