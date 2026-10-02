import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForGoogleUser, createSessionCookie, getAppUrl } from '@/lib/auth';
import { upsertUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = getAppUrl();

  if (error || !code) {
    console.error('Google OAuth error or code missing:', error);
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(error || 'missing_code')}`);
  }

  let returnTo = '/';
  if (state) {
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decodedState?.returnTo && decodedState.returnTo.startsWith('/')) {
        returnTo = decodedState.returnTo;
      }
    } catch {
      // fallback to default
    }
  }

  try {
    const googleProfile = await exchangeCodeForGoogleUser(code);
    if (!googleProfile) {
      return NextResponse.redirect(`${appUrl}/?auth_error=profile_exchange_failed`);
    }

    // Upsert into Neon DB
    const user = await upsertUser({
      google_id: googleProfile.googleId,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar_url: googleProfile.avatarUrl,
      role: 'customer',
    });

    // Create signed session cookie
    const token = await createSessionCookie(user);

    const response = NextResponse.redirect(`${appUrl}${returnTo}`);
    response.cookies.set('aura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error('Error during Google OAuth callback processing:', err);
    return NextResponse.redirect(`${appUrl}/?auth_error=callback_exception`);
  }
}
