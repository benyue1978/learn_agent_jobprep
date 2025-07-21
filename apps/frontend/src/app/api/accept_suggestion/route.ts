import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, suggested } = body;
    
    if (!field || !suggested) {
      return NextResponse.json(
        { error: 'Field and suggested are required' },
        { status: 400 }
      );
    }

    const updatedResume = await api.acceptSuggestion(field, suggested);
    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to accept suggestion' },
      { status: 500 }
    );
  }
} 