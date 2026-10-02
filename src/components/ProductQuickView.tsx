'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Star, Plus, Minus, ShoppingBag, Check, ArrowRight } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];

  const handleAdd = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs text-zinc-500 hover:text-black dark:hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 flex flex-col justify-between">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-4 border border-zinc-200 dark:border-zinc-700">
              <img
                src={images[selectedImage] || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx
                        ? 'border-zinc-900 dark:border-zinc-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">
                <span>{product.category_name || product.category_id}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.rating.toFixed(1)}</span>
                  <span>({product.rating_count} reviews)</span>
                </div>
              </div>

              <h2 className="font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif text-2xl font-semibold text-zinc-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-zinc-400 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="space-y-2 text-xs border-y border-zinc-100 dark:border-zinc-800 py-4 mb-6">
                {product.materials && (
                  <div className="flex">
                    <span className="w-24 text-zinc-400">Material:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">{product.materials}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex">
                    <span className="w-24 text-zinc-400">Dimensions:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">{product.dimensions}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-24 text-zinc-400">Availability:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 ${
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
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center gap-1 pt-1"
              >
                <span>View Complete Product Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
