'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Star, Plus, Minus, ShoppingBag, Check, Truck, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/?category=${product.category_id}`}
          className="hover:text-zinc-900 dark:hover:text-white transition"
        >
          {product.category_name || product.category_id}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Product Gallery (Left) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === idx
                      ? 'border-zinc-950 dark:border-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image */}
          <div className="flex-1 aspect-4/5 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
            <img
              src={images[selectedImage] || product.image_url}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Product Info (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest font-medium mb-2">
                <span>{product.category_name || product.category_id}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-zinc-900 dark:text-white">{product.rating.toFixed(1)}</span>
                  <span>({product.rating_count} verified reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-zinc-950 dark:text-white leading-tight">
                {product.title}
              </h1>

              {/* Price Block */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-semibold text-zinc-950 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-base text-zinc-400 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Specifications Box */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
              {product.materials && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Materials:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">{product.materials}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dimensions:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">{product.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Stock Status:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 text-right">
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
                </span>
              </div>
            </div>

            {/* Quantity and Add to Bag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-4 px-8 rounded-xl font-medium text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-sm ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href="/checkout"
                onClick={() => addToCart(product, quantity)}
                className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
              >
                Instant Buy with Express Checkout
              </Link>
            </div>

            {/* Reassurance Guarantees */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-xs text-zinc-500">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Complimentary tracked shipping on orders over $75</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>30-Day aesthetic trial with complimentary return labels</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Neon PostgreSQL order persistence & Mailgun receipts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-950 dark:text-white">
              Complementary Objects
            </h2>
            <Link
              href={`/?category=${product.category_id}`}
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
            >
              View More in Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
