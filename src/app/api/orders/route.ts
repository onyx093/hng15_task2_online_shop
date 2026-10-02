import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getUserOrders } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/mailgun';
import { OrderItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      shippingCountry,
      items,
      paymentMethod = 'card',
      notes,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required shipping fields.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty. Please add items to checkout.' },
        { status: 400 }
      );
    }

    // Associate logged in user if available
    const currentUser = await getCurrentUser();
    const userId = currentUser ? currentUser.id : null;

    // Compute verified totals
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

    // Persist in Neon PostgreSQL
    const createdOrder = await createOrder(
      {
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail.toLowerCase(),
        customer_phone: customerPhone || null,
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

    // Send Mailgun order confirmation email asynchronously
    const emailResult = await sendOrderConfirmationEmail(createdOrder);
    createdOrder.mailgun_message_id = emailResult.messageId;
    createdOrder.mailgun_status = emailResult.status;
    createdOrder.email_preview_html = emailResult.html;

    return NextResponse.json({
      success: true,
      order: createdOrder,
      emailStatus: emailResult.status,
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to place order.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const emailQuery = searchParams.get('email');

    const targetUser = currentUser ? currentUser.id : emailQuery;

    if (!targetUser) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await getUserOrders(targetUser);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
