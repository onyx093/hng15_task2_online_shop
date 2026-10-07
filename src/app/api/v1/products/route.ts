import { NextRequest } from 'next/server';
import { apiSuccess, apiServerError, OPTIONS } from '@/lib/api-response';
import { getProducts } from '@/lib/db';

export { OPTIONS };

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';

    const products = await getProducts({ category, search, sort, featuredOnly });

    return apiSuccess({ products }, { meta: { total: products.length } });
  } catch (error) {
    console.error('Error fetching products:', error);
    return apiServerError('Failed to fetch products.');
  }
}
