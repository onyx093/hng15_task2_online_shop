'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Search, LogOut, Package, Menu, X, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, services, signInWithGoogle, signOut, demoSignIn } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl tracking-[0.25em] font-medium text-zinc-950 dark:text-white block group-hover:opacity-80 transition">
                AURA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-zinc-500 uppercase -mt-0.5 block font-sans font-medium">
                Home & Living
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link href="/" className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition">
              Catalog
            </Link>
            <Link href="/?category=ceramics" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition">
              Ceramics
            </Link>
            <Link href="/?category=lighting" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition">
              Lighting
            </Link>
            <Link href="/?category=textiles" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition">
              Textiles
            </Link>
            <Link href="/?category=decor" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition">
              Objects & Decor
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vessels, lamps, throws..."
                    autoFocus
                    className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition"
                  aria-label="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Auth Section */}
            <div className="relative" ref={menuRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 mr-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 text-sm animate-in fade-in duration-100">
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (services.google) {
                        signInWithGoogle();
                      } else {
                        demoSignIn();
                      }
                    }}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                      />
                    </svg>
                    <span>{services.google ? 'Google Sign In' : 'Sign In'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-bold flex items-center justify-center animate-in zoom-in-75">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 py-1"
          >
            All Products
          </Link>
          <Link
            href="/?category=ceramics"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1"
          >
            Ceramics & Tableware
          </Link>
          <Link
            href="/?category=lighting"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1"
          >
            Architectural Lighting
          </Link>
          <Link
            href="/?category=textiles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1"
          >
            Organic Textiles
          </Link>
          <Link
            href="/?category=decor"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1"
          >
            Objects & Decor
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1 border-t border-zinc-100 dark:border-zinc-900 pt-3"
          >
            My Orders
          </Link>
        </div>
      )}
    </header>
  );
}
