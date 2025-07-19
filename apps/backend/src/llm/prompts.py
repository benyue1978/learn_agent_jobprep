"""
Prompt templates for LLM interactions
"""

RESUME_PARSE_PROMPT = """
请分析以下简历文本，提取结构化信息并生成改进建议。

简历文本：
{raw_resume_text}

请按照以下JSON格式返回结果：
{{
    "resume": {{
        "basics": {{
            "name": "姓名",
            "email": "邮箱",
            "phone": "电话",
            "location": "地点",
            "summary": "个人简介"
        }},
        "education": [
            {{
                "institution": "学校名称",
                "degree": "学位",
                "field_of_study": "专业",
                "start_date": "开始时间",
                "end_date": "结束时间",
                "gpa": "GPA",
                "courses": ["相关课程"]
            }}
        ],
        "work": [
            {{
                "company": "公司名称",
                "position": "职位",
                "start_date": "开始时间",
                "end_date": "结束时间",
                "description": "工作描述",
                "achievements": ["成就列表"]
            }}
        ],
        "skills": [
            {{
                "name": "技能名称",
                "level": "熟练程度",
                "category": "技能类别"
            }}
        ],
        "certificates": [
            {{
                "name": "证书名称",
                "issuer": "颁发机构",
                "date_obtained": "获得时间",
                "expiry_date": "过期时间"
            }}
        ]
    }},
    "suggestions": {{
        "field_key": ["建议内容"]
    }}
}}

请确保：
1. 提取的信息准确完整
2. 建议具体且有针对性
3. 返回格式为有效的JSON
"""

CHAT_PROMPT = """
你是一个专业的简历优化助手。基于用户的简历信息和对话历史，提供有针对性的建议和帮助。

当前简历信息：
{resume_context}

对话历史：
{chat_history}

用户问题：{user_message}

请提供：
1. 专业、友好的回复
2. 具体的改进建议
3. 如果涉及具体修改，请提供修改后的内容

回复格式：
{{
    "reply": "你的回复内容",
    "action": {{
        "type": "suggest_update",
        "field": "要修改的字段",
        "suggested": "建议的新内容"
    }}
}}
"""

IMPROVEMENT_PROMPT = """
基于以下简历信息，请提供具体的改进建议：

简历内容：
{resume_content}

用户要求：{improvement_request}

请提供：
1. 具体的改进建议
2. 修改后的内容示例
3. 改进的理由和好处

建议格式：
- 问题分析
- 具体建议
- 修改示例
- 预期效果
""" 