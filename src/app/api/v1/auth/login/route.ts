import { NextRequest } from 'next/server';
import { apiSuccess, apiBadRequest, apiUnauthorized, apiServerError, OPTIONS } from '@/lib/api-response';
import { verifyPassword } from '@/lib/passwords';
import { getUserByEmail } from '@/lib/db';
import { createSessionCookie } from '@/lib/auth';

export { OPTIONS };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiBadRequest('Email and password are required.');
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return apiUnauthorized('Invalid email or password.');
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return apiUnauthorized('Invalid email or password.');
    }

    const token = await createSessionCookie(user);

    return apiSuccess({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    return apiServerError('Login failed.');
  }
}
