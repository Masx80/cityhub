import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    timestamp: Date.now(),
    formatted: new Date().toISOString()
  });
} 