import { NextRequest, NextResponse } from 'next/server';
import { generateApp } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const appData = await generateApp(prompt);

    return NextResponse.json(appData);
  } catch (error) {
    console.error('Error in generate-app API:', error);
    return NextResponse.json(
      { error: 'Failed to generate app' },
      { status: 500 }
    );
  }
}