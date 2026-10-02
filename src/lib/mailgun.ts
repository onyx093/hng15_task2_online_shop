import { Order } from '@/types';
import { updateOrderEmailStatus } from './db';

export function isMailgunConfigured(): boolean {
  return Boolean(
    process.env.MAILGUN_API_KEY &&
    process.env.MAILGUN_DOMAIN &&
    !process.env.MAILGUN_API_KEY.includes('your-')
  );
}

export function generateOrderConfirmationHtml(order: Order): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 14px 8px; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 56px; vertical-align: top;">
                <img src="${item.product_image}" alt="${item.product_title}" width="48" height="48" style="border-radius: 6px; object-fit: cover; display: block; border: 1px solid #e5e5e5;" />
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <div style="font-weight: 600; color: #171717; font-size: 14px; line-height: 1.3;">${item.product_title}</div>
                <div style="font-size: 12px; color: #737373; margin-top: 2px;">Qty: ${item.quantity} × $${item.unit_price.toFixed(2)}</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 14px 8px; text-align: right; font-weight: 600; color: #171717; font-size: 14px; vertical-align: middle;">
          $${item.total_price.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${order.order_number}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; color: #171717;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #eaeaea;">
    <!-- Header -->
    <tr>
      <td style="background-color: #171717; padding: 32px 36px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 3px; font-weight: 400; text-transform: uppercase;">A U R A</h1>
        <p style="color: #a3a3a3; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">MINIMALIST HOME & LIVING</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 36px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td>
              <span style="background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">Order Confirmed</span>
              <h2 style="font-size: 20px; font-weight: 600; margin: 12px 0 6px 0; color: #171717;">Thank you for your order, ${order.customer_name}!</h2>
              <p style="font-size: 14px; color: #737373; line-height: 1.5; margin: 0 0 24px 0;">
                We have received your order and are carefully preparing it for dispatch. A tracking number will be sent once your package ships.
              </p>
            </td>
          </tr>

          <!-- Order Summary Box -->
          <tr>
            <td style="background-color: #f9fafb; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Order Number</td>
                  <td style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500; text-align: right;">Order Date</td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: #111827; font-weight: 600; padding-top: 4px;">${order.order_number}</td>
                  <td style="font-size: 15px; color: #111827; font-weight: 600; text-align: right; padding-top: 4px;">
                    ${new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding-top: 24px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 12px 0; border-bottom: 2px solid #171717; padding-bottom: 8px;">Order Details</h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding-top: 16px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #737373;">Subtotal</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #171717; text-align: right; font-weight: 500;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #737373;">Shipping</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #171717; text-align: right; font-weight: 500;">
                    ${order.shipping_fee === 0 ? '<span style="color: #047857;">FREE</span>' : `$${order.shipping_fee.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #737373;">Estimated Tax</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #171717; text-align: right; font-weight: 500;">$${order.tax.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: 700; color: #171717;">Total Paid</td>
                  <td style="padding: 14px 0 0 0; font-size: 18px; font-weight: 700; color: #171717; text-align: right;">$${order.total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Details -->
          <tr>
            <td style="padding-top: 28px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 18px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Shipping Destination</div>
                    <div style="font-size: 14px; color: #1f2937; line-height: 1.5;">
                      <strong>${order.customer_name}</strong><br/>
                      ${order.shipping_address}<br/>
                      ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br/>
                      ${order.shipping_country}
                    </div>
                  </td>
                  <td style="vertical-align: top; width: 50%; padding-left: 16px;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Payment Method</div>
                    <div style="font-size: 14px; color: #1f2937; line-height: 1.5;">
                      ${order.payment_method === 'cod' ? 'Cash on Delivery (Pending)' : 'Credit Card (Simulated Auth)'}<br/>
                      Status: <span style="color: #047857; font-weight: 600;">${order.payment_status.toUpperCase()}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 36px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">
          Need assistance with your order? Reply directly to this email or visit our help center.
        </p>
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
          © ${new Date().getFullYear()} AURA Home & Living. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOrderConfirmationEmail(order: Order): Promise<{
  success: boolean;
  messageId: string | null;
  status: 'sent' | 'failed' | 'mock_logged';
  html: string;
}> {
  const htmlContent = generateOrderConfirmationHtml(order);

  // If Mailgun is not configured, record mock preview so development continues without crashing
  if (!isMailgunConfigured()) {
    console.log(`[Mailgun Dev Mode] Confirmation email generated for ${order.customer_email} (Order ${order.order_number}). View preview in UI.`);
    await updateOrderEmailStatus(order.id, `mock_${Date.now()}`, 'mock_logged', htmlContent);
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      status: 'mock_logged',
      html: htmlContent,
    };
  }

  const apiKey = process.env.MAILGUN_API_KEY!;
  const domain = process.env.MAILGUN_DOMAIN!;
  const host = process.env.MAILGUN_HOST || 'api.mailgun.net';
  const from = process.env.EMAIL_FROM || `AURA Home & Living <orders@${domain}>`;

  const url = `https://${host}/v3/${domain}/messages`;
  const basicAuth = Buffer.from(`api:${apiKey}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('from', from);
  formData.append('to', order.customer_email);
  formData.append('subject', `Order Confirmed #${order.order_number} - AURA Home & Living`);
  formData.append('html', htmlContent);
  formData.append(
    'text',
    `Thank you for your order, ${order.customer_name}!\n\nOrder Number: ${order.order_number}\nTotal: $${order.total_amount.toFixed(2)}\n\nWe are preparing your items for delivery.`
  );

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Mailgun API Error (${res.status}):`, errText);
      await updateOrderEmailStatus(order.id, null, 'failed', htmlContent);
      return {
        success: false,
        messageId: null,
        status: 'failed',
        html: htmlContent,
      };
    }

    const data = (await res.json()) as { id?: string; message?: string };
    const messageId = data.id || null;
    console.log(`Mailgun email sent successfully! Message ID: ${messageId}`);

    await updateOrderEmailStatus(order.id, messageId, 'sent', htmlContent);
    return {
      success: true,
      messageId,
      status: 'sent',
      html: htmlContent,
    };
  } catch (error) {
    console.error('Mailgun network error:', error);
    await updateOrderEmailStatus(order.id, null, 'failed', htmlContent);
    return {
      success: false,
      messageId: null,
      status: 'failed',
      html: htmlContent,
    };
  }
}
