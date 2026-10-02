import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';

    const [products, categories] = await Promise.all([
      getProducts({ category, search, sort, featuredOnly }),
      getCategories(),
    ]);

    return NextResponse.json({
      products,
      categories,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products API:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
