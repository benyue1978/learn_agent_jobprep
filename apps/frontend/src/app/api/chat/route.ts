import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, referencedContent } = body;

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: referencedContent ? `引用内容：${referencedContent}\n\n问题：${message}` : message,
          },
        ],
        context: {
          referencedContent,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '聊天请求失败，请稍后重试' },
      { status: 500 }
    );
  }
} 