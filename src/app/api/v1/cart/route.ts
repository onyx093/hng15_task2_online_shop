import { NextRequest } from 'next/server';
import { apiSuccess, apiUnauthorized, apiBadRequest, apiServerError, OPTIONS } from '@/lib/api-response';
import { getUnifiedUser } from '@/lib/api-auth';
import { getCart, syncCartItem, clearCart } from '@/lib/db';

export { OPTIONS };

export async function GET(request: NextRequest) {
  try {
    const user = await getUnifiedUser(request);
    if (!user) {
      return apiUnauthorized('Please log in to view your cart.');
    }

    const cart = await getCart(user.id);
    return apiSuccess({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return apiServerError('Failed to fetch cart.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUnifiedUser(request);
    if (!user) {
      return apiUnauthorized('Please log in to modify your cart.');
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number') {
      return apiBadRequest('productId and quantity are required.');
    }

    // syncCartItem handles upsert (if quantity > 0) or delete (if quantity <= 0)
    await syncCartItem(user.id, productId, quantity);

    const cart = await getCart(user.id);
    return apiSuccess({ cart }, { status: 200 });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return apiServerError('Failed to sync cart.');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUnifiedUser(request);
    if (!user) {
      return apiUnauthorized('Please log in to modify your cart.');
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (productId) {
      // Remove specific item by syncing with quantity 0
      await syncCartItem(user.id, productId, 0);
      const cart = await getCart(user.id);
      return apiSuccess({ message: 'Item removed', cart });
    }

    // Clear entire cart
    await clearCart(user.id);
    return apiSuccess({ message: 'Cart cleared', cart: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return apiServerError('Failed to clear cart.');
  }
}
