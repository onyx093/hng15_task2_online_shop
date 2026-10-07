import { NextRequest } from 'next/server';
import { apiSuccess, apiBadRequest, apiUnauthorized, apiServerError, OPTIONS } from '@/lib/api-response';
import { getBearerTokenUser } from '@/lib/api-auth';
import { createOrder, getUserOrders } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/mailgun';
import { OrderItem } from '@/types';

export { OPTIONS };

export async function GET(request: NextRequest) {
  try {
    const user = await getBearerTokenUser(request);
    if (!user) {
      return apiUnauthorized();
    }

    const orders = await getUserOrders(user.id);
    return apiSuccess({ orders }, { meta: { total: orders.length } });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return apiServerError('Failed to fetch orders.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getBearerTokenUser(request);
    if (!user) {
      return apiUnauthorized();
    }

    const body = await request.json();
    const {
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      shippingCountry,
      items,
      paymentMethod = 'card',
      notes,
    } = body;

    if (!shippingAddress || !shippingCity || !shippingPostalCode) {
      return apiBadRequest('Please fill in all required shipping fields.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiBadRequest('Cart is empty. Please add items to checkout.');
    }

    const orderItems: OrderItem[] = items.map((it: {
      productId: string;
      title: string;
      image: string;
      price: number;
      quantity: number;
    }) => ({
      product_id: it.productId,
      product_title: it.title,
      product_image: it.image,
      unit_price: Number(it.price),
      quantity: Number(it.quantity),
      total_price: Number((Number(it.price) * Number(it.quantity)).toFixed(2)),
    }));

    const subtotal = orderItems.reduce((acc, it) => acc + it.total_price, 0);
    const shippingFee = subtotal >= 75 ? 0 : 8.5;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));

    const createdOrder = await createOrder(
      {
        user_id: user.id,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: null, // Phone can be added to body later if needed
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState || '',
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry || 'United States',
        subtotal,
        shipping_fee: shippingFee,
        tax,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'paid',
        order_status: 'confirmed',
        notes: notes || null,
      },
      orderItems
    );

    const emailResult = await sendOrderConfirmationEmail(createdOrder);
    createdOrder.mailgun_message_id = emailResult.messageId;
    createdOrder.mailgun_status = emailResult.status;
    createdOrder.email_preview_html = emailResult.html;

    return apiSuccess({ order: createdOrder, emailStatus: emailResult.status }, { status: 201 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return apiServerError('Failed to place order.');
  }
}
