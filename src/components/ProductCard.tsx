'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900/60 rounded-2xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-4/5 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-red-600 text-white rounded-full shadow-xs">
              Save {discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-zinc-950/80 backdrop-blur-xs text-white rounded-full">
              Curated
            </span>
          )}
          {product.stock <= 8 && product.stock > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-amber-500/90 backdrop-blur-xs text-white rounded-full">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs text-zinc-900 dark:text-zinc-100 text-xs font-semibold shadow-md hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl shadow-md transition flex items-center justify-center ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100'
            }`}
            aria-label="Add to Bag"
          >
            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-widest font-medium mb-1.5">
            <span>{product.category_name || product.category_id}</span>
            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.rating.toFixed(1)}</span>
              <span className="text-[10px]">({product.rating_count})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
            <h3 className="font-serif text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Materials / Dimensions Subtitle */}
          {product.materials && (
            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1">
              {product.materials}
            </p>
          )}
        </div>

        {/* Price & Stock */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base font-semibold text-zinc-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-zinc-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white flex items-center gap-1 hover:underline underline-offset-4"
          >
            {isAdded ? 'Added' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
