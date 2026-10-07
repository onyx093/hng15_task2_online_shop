import { NextRequest } from 'next/server';
import { User } from '@/types';
import { verifySessionCookie } from './auth'; // Reuse the JWT verification from auth.ts
import { getUserByEmail } from './db';

/**
 * Extracts and verifies the Bearer token from the request.
 */
export async function getBearerTokenUser(request: NextRequest | Request): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const sessionUser = await verifySessionCookie(token);
  if (!sessionUser) return null;

  // Optionally fetch the full user from DB to ensure they still exist / get latest data
  const dbUser = await getUserByEmail(sessionUser.email);
  return dbUser || sessionUser;
}
