import { NextRequest } from 'next/server';
import { apiSuccess, OPTIONS } from '@/lib/api-response';
import { isNeonConfigured } from '@/lib/db';
import { isGoogleAuthConfigured } from '@/lib/auth';
import { isMailgunConfigured } from '@/lib/mailgun';

export { OPTIONS };

export async function GET(request: NextRequest) {
  return apiSuccess({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      neon: isNeonConfigured(),
      google: isGoogleAuthConfigured(),
      mailgun: isMailgunConfigured(),
    }
  });
}
