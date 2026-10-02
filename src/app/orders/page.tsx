'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { Package, ArrowRight, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';
import { EmailPreviewModal } from '@/components/EmailPreviewModal';

export default function OrdersPage() {
  const { user, services, signInWithGoogle, demoSignIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailLookup, setEmailLookup] = useState('');
  const [selectedPreviewOrder, setSelectedPreviewOrder] = useState<Order | null>(null);

  const fetchOrders = async (targetEmail?: string) => {
    setLoading(true);
    try {
      const url = targetEmail ? `/api/orders?email=${encodeURIComponent(targetEmail)}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailLookup.trim()) {
      fetchOrders(emailLookup.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-zinc-950 dark:text-white">
            Order History
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track and view all orders persisted in your Neon PostgreSQL database.
          </p>
        </div>

        {!user && (
          <button
            onClick={() => {
              if (services.google) {
                signInWithGoogle('/orders');
              } else {
                demoSignIn();
              }
            }}
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition self-start sm:self-auto"
          >
            {services.google ? 'Sign in with Google' : 'Sign in as Demo Customer'}
          </button>
        )}
      </div>

      {/* Guest Email Lookup Bar */}
      {!user && (
        <form onSubmit={handleLookup} className="mb-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-serif text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Looking for orders placed as a guest?
          </h3>
          <div className="flex gap-2 max-w-md">
            <input
              type="email"
              placeholder="Enter order email address..."
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition"
            >
              Lookup
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500">Querying orders from Neon DB...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            No orders found
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            When you complete an order on the checkout page, it will automatically be persisted here and confirmed via Mailgun.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 transition hover:border-zinc-400 dark:hover:border-zinc-700"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Order ID</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 text-sm font-serif">{o.order_number}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Placed On</span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {new Date(o.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Customer</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{o.customer_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{o.order_status.toUpperCase()}</span>
                  </span>

                  <span className="text-base font-serif font-bold text-zinc-950 dark:text-white">
                    ${o.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-12 h-14 object-cover rounded-lg bg-zinc-200 dark:bg-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {item.product_title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Mailgun Status: <strong>{o.mailgun_status || 'sent'}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPreviewOrder(o)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition flex items-center gap-1.5"
                  >
                    <span>View Email Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <Link
                    href={`/checkout/success/${o.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 transition flex items-center gap-1.5"
                  >
                    <span>View Receipt</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPreviewOrder && (
        <EmailPreviewModal
          order={selectedPreviewOrder}
          isOpen={Boolean(selectedPreviewOrder)}
          onClose={() => setSelectedPreviewOrder(null)}
        />
      )}
    </div>
  );
}
