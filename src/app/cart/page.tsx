'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    tax,
    total,
    freeShippingThreshold,
    freeShippingRemaining,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'AURA10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "AURA10" for 10% off.');
    }
  };

  const discountAmount = promoApplied ? Number((subtotal * 0.1).toFixed(2)) : 0;
  const finalTotal = Number((total - discountAmount).toFixed(2));

  const freeShippingPercent = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-medium text-zinc-950 dark:text-white">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} selected
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Your bag is currently empty
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            Explore our curated catalog of Japanese stonewares, Belgian linens, and ambient luminaires.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items Table (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Free shipping bar */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              {freeShippingRemaining > 0 ? (
                <div>
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    <span>Add <strong>${freeShippingRemaining.toFixed(2)}</strong> more for free carbon-neutral shipping</span>
                    <span>{freeShippingPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 dark:bg-zinc-100 rounded-full transition-all duration-300"
                      style={{ width: `${freeShippingPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  You’ve qualified for complimentary carbon-neutral shipping!
                </p>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-6 flex gap-6">
                  <Link
                    href={`/products/${product.id}`}
                    className="relative w-24 h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800"
                  >
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                            {product.category_name || product.category_id}
                          </span>
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-serif text-base font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 transition">
                              {product.title}
                            </h3>
                          </Link>
                          {product.materials && (
                            <p className="text-xs text-zinc-500 mt-0.5">{product.materials}</p>
                          )}
                        </div>

                        <span className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 min-w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary (Right 5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
              <h2 className="font-serif text-xl font-medium text-zinc-950 dark:text-white">
                Order Summary
              </h2>

              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (try AURA10)"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Promo code AURA10 applied! 10% discount included.
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-500 font-medium">{promoError}</p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-base font-semibold text-zinc-950 dark:text-white">
                  <span>Grand Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-medium text-xs tracking-wider uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Neon PostgreSQL Persisted • Mailgun Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
