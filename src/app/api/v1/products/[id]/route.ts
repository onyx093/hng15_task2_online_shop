import { NextRequest } from 'next/server';
import { apiSuccess, apiNotFound, apiServerError, OPTIONS } from '@/lib/api-response';
import { getProductById } from '@/lib/db';

export { OPTIONS };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return apiNotFound('Product not found.');
    }

    return apiSuccess({ product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return apiServerError('Failed to fetch product.');
  }
}
