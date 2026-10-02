import { NextRequest, NextResponse } from 'next/server';
import { isGoogleAuthConfigured, getGoogleAuthUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get('returnTo') || '/';

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL(`/?auth_notice=google_not_configured`, request.url));
  }

  const authUrl = getGoogleAuthUrl(returnTo);
  return NextResponse.redirect(authUrl);
}
