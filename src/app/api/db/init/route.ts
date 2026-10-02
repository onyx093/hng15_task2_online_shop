import { NextResponse } from 'next/server';
import { initDatabase, isNeonConfigured } from '@/lib/db';

export async function POST() {
  const result = await initDatabase();
  return NextResponse.json(result);
}

export async function GET() {
  const isNeon = isNeonConfigured();
  const result = await initDatabase();
  return NextResponse.json({ ...result, isNeonConfigured: isNeon });
}
