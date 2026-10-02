import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/types';
import { getUserByEmail } from './db';

const SESSION_COOKIE_NAME = 'aura_session';
const DEFAULT_SECRET = 'aura-shop-development-secret-jwt-key-2026-very-secure';

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes('your-')
  );
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

export function getGoogleRedirectUri(): string {
  return `${getAppUrl()}/api/auth/callback/google`;
}

export function getGoogleAuthUrl(returnTo: string = '/'): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = getGoogleRedirectUri();
  const state = Buffer.from(JSON.stringify({ returnTo, nonce: Math.random().toString(36).substring(2) })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function createSessionCookie(user: User): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role || 'customer',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return token;
}

export async function verifySessionCookie(token: string): Promise<User | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      avatar_url: payload.avatar_url as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const sessionUser = await verifySessionCookie(sessionCookie.value);
    if (!sessionUser) return null;

    // Refresh user from DB if available
    const dbUser = await getUserByEmail(sessionUser.email);
    return dbUser || sessionUser;
  } catch {
    return null;
  }
}

export async function exchangeCodeForGoogleUser(code: string): Promise<{
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string;
} | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !clientSecret) return null;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange error:', await tokenRes.text());
      return null;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string; id_token?: string };

    // 2. Fetch user profile from Google UserInfo
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error('Google userinfo fetch error:', await userRes.text());
      return null;
    }

    const userData = (await userRes.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    return {
      googleId: userData.sub,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      avatarUrl: userData.picture || '',
    };
  } catch (error) {
    console.error('Error exchanging Google OAuth code:', error);
    return null;
  }
}
