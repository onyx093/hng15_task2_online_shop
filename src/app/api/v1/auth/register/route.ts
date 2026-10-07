import { NextRequest } from 'next/server';
import { apiSuccess, apiBadRequest, apiServerError, OPTIONS } from '@/lib/api-response';
import { hashPassword } from '@/lib/passwords';
import { upsertUser, getUserByEmail } from '@/lib/db';
import { createSessionCookie } from '@/lib/auth';

export { OPTIONS };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return apiBadRequest('Email, password, and name are required.');
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return apiBadRequest('Email is already registered.');
    }

    const password_hash = await hashPassword(password);

    const user = await upsertUser({
      email,
      name,
      password_hash,
      role: 'customer',
    });

    const token = await createSessionCookie(user);

    return apiSuccess({ user, token }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return apiServerError('Registration failed.');
  }
}
