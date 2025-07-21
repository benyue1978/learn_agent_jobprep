import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  try {
    const resume = await api.getResume();
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await api.saveResume(body.resume);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
} 