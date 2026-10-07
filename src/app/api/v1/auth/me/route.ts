import { NextRequest } from 'next/server';
import { apiSuccess, apiUnauthorized, OPTIONS } from '@/lib/api-response';
import { getBearerTokenUser } from '@/lib/api-auth';

export { OPTIONS };

export async function GET(request: NextRequest) {
  const user = await getBearerTokenUser(request);

  if (!user) {
    return apiUnauthorized();
  }

  return apiSuccess({ user });
}
