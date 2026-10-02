import { NextResponse } from 'next/server';
import { getCurrentUser, isGoogleAuthConfigured } from '@/lib/auth';
import { isNeonConfigured } from '@/lib/db';
import { isMailgunConfigured } from '@/lib/mailgun';

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user,
    services: {
      neon: isNeonConfigured(),
      google: isGoogleAuthConfigured(),
      mailgun: isMailgunConfigured(),
    },
  });
}
