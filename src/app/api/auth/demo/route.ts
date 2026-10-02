import { NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';
import { upsertUser } from '@/lib/db';

export async function POST() {
  try {
    const demoUser = await upsertUser({
      google_id: 'demo_google_id_9999',
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      role: 'customer',
    });

    const token = await createSessionCookie(demoUser);

    const response = NextResponse.json({ success: true, user: demoUser });
    response.cookies.set('aura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
