import { NextRequest } from 'next/server';
import { apiSuccess, apiServerError, OPTIONS } from '@/lib/api-response';
import { getCategories } from '@/lib/db';

export { OPTIONS };

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    return apiSuccess({ categories }, { meta: { total: categories.length } });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return apiServerError('Failed to fetch categories.');
  }
}
