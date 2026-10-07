import { NextRequest } from 'next/server';
import { apiSuccess, OPTIONS } from '@/lib/api-response';

export { OPTIONS };

export async function POST(request: NextRequest) {
  // Since mobile clients manage their own tokens (stateless), 
  // we just return a success response. The client will discard the token.
  return apiSuccess({ message: 'Logged out successfully' });
}
