import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/auth';

export async function GET() {
  const appUrl = getAppUrl();
  const response = NextResponse.redirect(appUrl);
  response.cookies.set('aura_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('aura_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
