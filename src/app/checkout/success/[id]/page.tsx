'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';
import { EmailPreviewModal } from '@/components/EmailPreviewModal';
import {
  CheckCircle2,
  Package,
  Mail,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#171717', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    // Fetch order details
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .catch((err) => console.error('Failed to load order:', err))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-zinc-500 font-medium">Retrieving order verification from Neon...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Order Not Located
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          We could not find an order matching identifier "{orderId}".
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/60 dark:bg-black min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Order Confirmed & Persisted in Neon
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-zinc-950 dark:text-white">
            Thank you, {order.customer_name}!
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your order <strong>#{order.order_number}</strong> has been received and stored in our database. We are preparing your objects for secure shipment.
          </p>
        </div>

        {/* Mailgun Delivery Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Confirmation Email via Mailgun
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {order.mailgun_status === 'sent' ? 'Live Dispatched' : 'Rendered & Prepared'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Sent to: <span className="font-medium text-zinc-800 dark:text-zinc-200">{order.customer_email}</span>
                {order.mailgun_message_id && ` • ID: ${order.mailgun_message_id}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <span>View Email Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
          {/* Top Info Bar */}
          <div className="px-6 sm:px-8 py-5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-medium">Order Number</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">{order.order_number}</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-medium">Date</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-medium">Payment</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block uppercase">
                {order.payment_method === 'cod' ? 'Pay on Delivery' : 'Paid (Card)'}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-medium">Fulfillment</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block capitalize">
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6 sm:p-8">
            <h3 className="font-serif text-base font-medium text-zinc-950 dark:text-white mb-4">
              Items in This Shipment
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-y border-zinc-100 dark:border-zinc-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={item.product_image}
                        alt={item.product_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.product_title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    ${item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Address & Totals Grid */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Shipping info */}
              <div className="space-y-2 text-xs">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                  Shipping Address
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>{order.customer_name}</strong>
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                  <br />
                  {order.shipping_country}
                  {order.customer_phone && <><br />Phone: {order.customer_phone}</>}
                </p>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {order.shipping_fee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${order.shipping_fee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-base font-semibold text-zinc-950 dark:text-white">
                  <span>Grand Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold tracking-wider uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition text-center"
          >
            Continue Shopping
          </Link>

          <Link
            href="/orders"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold tracking-wider uppercase text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-center"
          >
            View Order History
          </Link>
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        order={order}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
}
