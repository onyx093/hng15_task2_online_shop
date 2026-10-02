import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      {/* Value Propositions */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100 mb-1">Carbon-Neutral Shipping</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Complimentary tracked delivery on all orders over $75.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100 mb-1">Authentic Craftsmanship</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Individually wheel-thrown ceramics and natural stone lighting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100 mb-1">30-Day Aesthetic Trial</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Experience pieces in your living space with hassle-free returns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100 mb-1">Artisan Community</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Direct partnership supporting independent heritage workshops.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-[0.25em] font-medium text-white block">
                AURA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-zinc-500 uppercase block font-sans font-medium">
                Home & Living
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Dedicated to quiet forms, enduring natural materials, and the timeless beauty of intentional living. Every piece is selected to bring stillness and warmth to the modern sanctuary.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-500">
              <span>Stack:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">Neon DB</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">Mailgun</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">Google Cloud OAuth</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">All Essentials</Link>
              </li>
              <li>
                <Link href="/?category=ceramics" className="hover:text-white transition">Ceramics & Stoneware</Link>
              </li>
              <li>
                <Link href="/?category=lighting" className="hover:text-white transition">Architectural Lighting</Link>
              </li>
              <li>
                <Link href="/?category=textiles" className="hover:text-white transition">Belgian Linens & Throws</Link>
              </li>
              <li>
                <Link href="/?category=decor" className="hover:text-white transition">Objects & Catchalls</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cart" className="hover:text-white transition">Shopping Bag</Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition">Express Checkout</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">Order History</Link>
              </li>
              <li>
                <a href="#newsletter" className="hover:text-white transition">Care & Maintenance</a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">The Aura Journal</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Receive curated editions on architectural interiors, artisan studio features, and seasonal releases.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button className="px-3 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs shrink-0 hover:bg-zinc-200 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AURA Home & Living. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-400">Privacy Policy</Link>
            <Link href="/" className="hover:text-zinc-400">Terms of Service</Link>
            <Link href="/orders" className="hover:text-zinc-400">Order Tracking</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
