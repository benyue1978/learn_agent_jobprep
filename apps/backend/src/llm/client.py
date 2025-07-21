import json
from typing import Dict, Any

from src.llm.prompts import RESUME_PARSE_PROMPT, CHAT_PROMPT


class LLMClient:
    """LLM client for interacting with language models"""
    
    async def parse_resume(self, resume_text: str) -> str:
        """
        Parse resume text and return structured JSON
        """
        # Mock implementation - in production, this would call actual LLM API
        mock_resume = {
            "basics": {
                "name": "张三",
                "email": "zhangsan@example.com",
                "phone": "13800138000",
                "location": "北京",
                "summary": "经验丰富的软件工程师，专注于后端开发和系统架构",
                "suggestions": [
                    {
                        "field": "basics.summary",
                        "current": "经验丰富的软件工程师，专注于后端开发和系统架构",
                        "suggested": "5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计，具备高并发系统优化经验",
                        "reason": "添加具体年限、更专业的技术描述和核心能力"
                    },
                    {
                        "field": "basics.location",
                        "current": "北京",
                        "suggested": "北京市朝阳区",
                        "reason": "提供更具体的地理位置信息"
                    }
                ]
            },
            "education": [
                {
                    "institution": "清华大学",
                    "degree": "计算机科学学士",
                    "field_of_study": "计算机科学与技术",
                    "start_date": "2018-09",
                    "end_date": "2022-07",
                    "gpa": "3.8/4.0",
                    "suggestions": [
                        {
                            "field": "education[0].gpa",
                            "current": "3.8/4.0",
                            "suggested": "3.8/4.0 (优秀)",
                            "reason": "添加评价说明，突出学术表现"
                        },
                        {
                            "field": "education[0].field_of_study",
                            "current": "计算机科学与技术",
                            "suggested": "计算机科学与技术（人工智能方向）",
                            "reason": "添加专业方向，突出技术专长"
                        }
                    ]
                }
            ],
            "work": [
                {
                    "company": "阿里巴巴",
                    "position": "高级软件工程师",
                    "start_date": "2022-08",
                    "end_date": "2024-12",
                    "description": "负责电商平台后端开发，使用Java和Spring框架",
                    "achievements": [
                        "优化系统性能，提升响应速度30%",
                        "设计并实现微服务架构",
                        "带领5人团队完成核心功能开发"
                    ],
                    "suggestions": [
                        {
                            "field": "work[0].description",
                            "current": "负责电商平台后端开发，使用Java和Spring框架",
                            "suggested": "负责阿里巴巴电商平台后端开发，使用Java和Spring框架，处理高并发订单系统，日均处理订单量100万+",
                            "reason": "添加具体公司名称、系统规模和业务场景"
                        },
                        {
                            "field": "work[0].achievements[0]",
                            "current": "优化系统性能，提升响应速度30%",
                            "suggested": "优化订单处理系统性能，将平均响应时间从500ms降低到350ms，提升30%，减少用户等待时间",
                            "reason": "添加具体的技术指标和业务价值"
                        },
                        {
                            "field": "work[0].position",
                            "current": "高级软件工程师",
                            "suggested": "高级后端工程师",
                            "reason": "使用更精确的职位描述"
                        }
                    ]
                }
            ],
            "skills": [
                {
                    "name": "Java", 
                    "level": "高级", 
                    "category": "编程语言",
                    "suggestions": [
                        {
                            "field": "skills[0].level",
                            "current": "高级",
                            "suggested": "精通",
                            "reason": "使用更专业的技能等级描述"
                        }
                    ]
                },
                {
                    "name": "Python", 
                    "level": "中级", 
                    "category": "编程语言",
                    "suggestions": [
                        {
                            "field": "skills[1].level",
                            "current": "中级",
                            "suggested": "熟练",
                            "reason": "使用更准确的技能描述"
                        }
                    ]
                },
                {
                    "name": "Spring Boot", 
                    "level": "高级", 
                    "category": "框架",
                    "suggestions": [
                        {
                            "field": "skills[2].name",
                            "current": "Spring Boot",
                            "suggested": "Spring Boot/Spring Cloud",
                            "reason": "添加微服务框架，突出全栈能力"
                        }
                    ]
                },
                {"name": "MySQL", "level": "中级", "category": "数据库"},
                {"name": "Docker", "level": "中级", "category": "工具"}
            ],
            "certificates": [
                {
                    "name": "AWS认证解决方案架构师",
                    "issuer": "Amazon Web Services",
                    "date": "2023-06",
                    "description": "云架构设计和部署认证",
                    "suggestions": [
                        {
                            "field": "certificates[0].description",
                            "current": "云架构设计和部署认证",
                            "suggested": "AWS官方认证的云架构设计和部署专家，具备企业级云解决方案设计能力，熟悉容器化和无服务器架构",
                            "reason": "添加更详细的认证描述和技能说明"
                        }
                    ]
                }
            ]
        }
        
        return json.dumps(mock_resume, ensure_ascii=False)
    
    async def generate_suggestions(self, resume_data: Dict[str, Any]) -> str:
        """
        Generate optimization suggestions based on resume data
        """
        # Mock implementation - in production, this would call actual LLM API
        # This method is now less important since suggestions are embedded in the resume data
        mock_suggestions = [
            {
                "field": "work[0].description",
                "current": "负责电商平台后端开发，使用Java和Spring框架",
                "suggested": "负责阿里巴巴电商平台后端开发，使用Java和Spring框架，处理高并发订单系统，日均处理订单量100万+",
                "reason": "添加具体公司名称、系统规模和业务场景"
            },
            {
                "field": "basics.summary",
                "current": "经验丰富的软件工程师，专注于后端开发和系统架构",
                "suggested": "5年经验的高级软件工程师，专注于大规模分布式系统后端开发和微服务架构设计，具备高并发系统优化经验",
                "reason": "添加具体年限、更专业的技术描述和核心能力"
            },
            {
                "field": "work[0].achievements[0]",
                "current": "优化系统性能，提升响应速度30%",
                "suggested": "优化订单处理系统性能，将平均响应时间从500ms降低到350ms，提升30%，减少用户等待时间",
                "reason": "添加具体的技术指标和业务价值"
            }
        ]
        
        return json.dumps(mock_suggestions, ensure_ascii=False)
    
    async def chat(self, prompt: str) -> str:
        """
        Process chat prompt and return response
        """
        # Mock implementation - in production, this would call actual LLM API
        
        if "建议" in prompt or "改进" in prompt or "优化" in prompt:
            return "request_suggestion"
        elif "确认" in prompt or "同意" in prompt or "接受" in prompt:
            return "confirm_suggestion"
        elif "拒绝" in prompt or "不同意" in prompt or "不要" in prompt:
            return "reject_suggestion"
        elif "你好" in prompt or "您好" in prompt:
            return "chat"
        else:
            return "chat"
    
    async def chat_response(self, prompt: str) -> str:
        """
        Generate chat response (not routing)
        """
        # Mock implementation - in production, this would call actual LLM API
        
        if "你好" in prompt or "您好" in prompt:
            return "您好！我是您的简历优化助手。我可以帮您分析简历、提供改进建议，或者回答关于简历的任何问题。请告诉我您需要什么帮助？"
        else:
            return "我理解您的问题。作为简历优化助手，我可以帮您：\n\n1. 分析简历结构和内容\n2. 提供具体的改进建议\n3. 优化描述语言\n4. 突出关键成就\n\n请告诉我您希望重点优化哪个方面？"


# Global LLM client instance
llm_client = LLMClient() 