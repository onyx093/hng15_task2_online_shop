import { NextRequest } from 'next/server';
import { apiSuccess, apiBadRequest, apiServerError, OPTIONS } from '@/lib/api-response';
import { exchangeCodeForGoogleUser, createSessionCookie } from '@/lib/auth';
import { upsertUser } from '@/lib/db';

export { OPTIONS };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return apiBadRequest('Authorization code is required.');
    }

    const googleProfile = await exchangeCodeForGoogleUser(code);
    if (!googleProfile) {
      return apiBadRequest('Failed to exchange Google code.');
    }

    const user = await upsertUser({
      google_id: googleProfile.googleId,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar_url: googleProfile.avatarUrl,
      role: 'customer',
    });

    const token = await createSessionCookie(user);

    return apiSuccess({ user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    return apiServerError('Google auth failed.');
  }
}
