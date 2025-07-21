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

# Chat workflow prompts
CHAT_ROUTER_PROMPT = """
你是一个智能对话路由助手。请分析用户的输入，判断用户的意图。

用户输入：{user_text}

对话历史：
{history}

简历信息：
{resume}

请判断用户意图，并返回以下之一：
1. "request_suggestion" - 用户请求生成建议或改进简历
2. "confirm_suggestion" - 用户确认或接受之前的建议
3. "reject_suggestion" - 用户拒绝或否定之前的建议
4. "chat" - 普通聊天或询问

请只返回意图关键词，不要其他内容。
"""

SUGGESTION_PROMPT = """
你是一个专业的简历优化助手。用户请求生成简历改进建议。

用户输入：{user_text}

对话历史：
{history}

简历信息：
{resume}

请分析用户的请求，生成具体的简历改进建议。建议应该：
1. 针对具体的简历字段
2. 提供当前内容和建议内容的对比
3. 说明改进的理由

请返回建议的详细信息，包括：
- 要修改的字段路径
- 当前内容
- 建议的新内容
- 改进理由
"""

CONFIRMATION_PROMPT = """
用户正在确认或讨论之前的建议。

用户输入：{user_text}

当前建议：{suggestion}

简历信息：
{resume}

请判断用户是否确认了这个建议。如果用户表示同意、接受、确认等，请返回"确认"；否则返回"继续讨论"。

请只返回"确认"或"继续讨论"，不要其他内容。
"""

CHAT_RESPONSE_PROMPT = """
你是一个专业的简历优化助手。请基于用户的输入和简历信息，提供友好、专业的回复。

用户输入：{user_text}

对话历史：
{history}

简历信息：
{resume}

请提供：
1. 专业、友好的回复
2. 针对用户问题的具体建议
3. 如果需要，可以主动提供简历改进建议

回复应该自然、有用，并鼓励用户继续对话。
""" 