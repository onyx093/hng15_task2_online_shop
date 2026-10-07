import { NextRequest } from 'next/server';
import { apiSuccess, apiNotFound, apiUnauthorized, apiForbidden, apiServerError, OPTIONS } from '@/lib/api-response';
import { getBearerTokenUser } from '@/lib/api-auth';
import { getOrderById } from '@/lib/db';

export { OPTIONS };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getBearerTokenUser(request);
    if (!user) {
      return apiUnauthorized();
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return apiNotFound('Order not found.');
    }

    // Ensure the user owns the order
    if (order.user_id !== user.id) {
      return apiForbidden('You do not have permission to view this order.');
    }

    return apiSuccess({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return apiServerError('Failed to fetch order.');
  }
}
