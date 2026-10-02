'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Building,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, shippingFee, tax, total, clearCart } = useCart();
  const { user, services, signInWithGoogle, demoSignIn } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    apartment: '',
    shippingCity: '',
    shippingState: 'CA',
    shippingPostalCode: '',
    shippingCountry: 'United States',
    paymentMethod: 'card',
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '888',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill customer name & email if logged in via Google
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add items before checking out.');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
      setErrorMessage('Please fill out all required shipping and contact fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.apartment ? `${formData.shippingAddress}, ${formData.apartment}` : formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingPostalCode: formData.shippingPostalCode,
        shippingCountry: formData.shippingCountry,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: items.map((it) => ({
          productId: it.product.id,
          title: it.product.title,
          image: it.product.image_url,
          price: it.product.price,
          quantity: it.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Clear the client cart upon successful creation
      clearCart();

      // Redirect to Order Confirmation Success page
      router.push(`/checkout/success/${data.order.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage((err as Error).message || 'An error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  // If cart is empty and not submitting, offer return link
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Your shopping bag is empty
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
          Add items to your bag before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition inline-block"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4);

  return (
    <div className="bg-zinc-50/60 dark:bg-black min-h-screen py-10 sm:py-14 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <Link
              href="/cart"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shopping Bag</span>
            </Link>
            <h1 className="font-serif text-3xl font-medium text-zinc-950 dark:text-white">
              Express Checkout
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white dark:bg-zinc-900 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Fields (Left 7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Contact Info Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h2 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
                      Customer Contact
                    </h2>
                  </div>

                  {user ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticated via Google</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (services.google) {
                          signInWithGoogle('/checkout');
                        } else {
                          demoSignIn();
                        }
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1.5"
                    >
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address (for Mailgun Receipt) *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="elena@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Mobile Phone (for delivery courier updates)
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h2 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Shipping Destination
                  </h2>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      required
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="742 Evergreen Terrace"
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Apt / Suite / Floor
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Suite 4B"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        required
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        placeholder="San Francisco"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="shippingPostalCode"
                        required
                        value={formData.shippingPostalCode}
                        onChange={handleInputChange}
                        placeholder="94107"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        placeholder="California"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Country
                      </label>
                      <select
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Japan">Japan</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Delivery Instructions / Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Leave with building doorman or gate code #4092"
                      className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-white transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h2 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
                      Payment Verification
                    </h2>
                  </div>

                  <span className="text-xs text-zinc-500 font-mono">
                    Instant Simulation
                  </span>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      formData.paymentMethod === 'card'
                        ? 'border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/80 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <div>
                      <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Credit / Debit Card
                      </span>
                      <span className="text-[10px] text-zinc-500">Visa, Mastercard, Amex</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      formData.paymentMethod === 'cod'
                        ? 'border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/80 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <Building className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <div>
                      <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Pay on Delivery
                      </span>
                      <span className="text-[10px] text-zinc-500">Pay upon courier arrival</span>
                    </div>
                  </button>
                </div>

                {/* Card input mockup fields */}
                {formData.paymentMethod === 'card' && (
                  <div className="pt-3 space-y-3">
                    <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-zinc-900 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                          VISA
                        </div>
                        <div>
                          <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            •••• •••• •••• 4242
                          </p>
                          <p className="text-[10px] text-zinc-500">Exp 12/28 • Auth Token OK</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Test Card Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Card Expiry</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Security Code (CVV)</label>
                        <input
                          type="password"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Order Recap (Right 5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-serif text-lg font-medium text-zinc-950 dark:text-white">
                    Order Summary ({itemCount})
                  </h3>
                  <Link href="/cart" className="text-xs text-zinc-500 hover:underline">
                    Edit Bag
                  </Link>
                </div>

                {/* Items preview list */}
                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 pr-1 space-y-3">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-950 text-white text-[9px] font-bold flex items-center justify-center">
                          {quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          {quantity} × ${product.price.toFixed(2)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Date Guarantee */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Truck className="w-5 h-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Estimated Dispatch: 24h
                    </span>
                    <span>
                      Arrives by{' '}
                      {estimatedDeliveryDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Pricing Totals */}
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbon-Neutral Shipping</span>
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
                  <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-base font-semibold text-zinc-950 dark:text-white">
                    <span>Total Due</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submission CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Persisting in Neon & Sending Mailgun Receipt...</span>
                      </>
                    ) : (
                      <span>Place Order • ${total.toFixed(2)}</span>
                    )}
                  </button>

                  <div className="flex flex-col items-center gap-1.5 text-[11px] text-zinc-500 pt-1 text-center">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Neon PostgreSQL Encrypted Database Persistence</span>
                    </div>
                    <span>Confirmation email automatically generated & sent via Mailgun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
