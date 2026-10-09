'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aura_cart_v1';
const FREE_SHIPPING_THRESHOLD = 75.0;
const STANDARD_SHIPPING_FEE = 8.5;
const ESTIMATED_TAX_RATE = 0.08; // 8%

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart to storage:', e);
    }
  }, [items]);

  // Fetch from database on mount if logged in
  useEffect(() => {
    fetch('/api/v1/cart')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.cart && data.data.cart.length > 0) {
          setItems(data.data.cart);
        }
      })
      .catch((e) => console.error('Failed to load cart from DB:', e));
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    let finalQuantity = quantity;
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        finalQuantity = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: finalQuantity } : item
        );
      }
      finalQuantity = Math.min(product.stock, quantity);
      return [...prev, { product, quantity: finalQuantity }];
    });
    setIsCartOpen(true);

    // Sync to API
    fetch('/api/v1/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: finalQuantity }),
    }).catch(console.error);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    
    // Sync to API
    fetch(`/api/v1/cart?productId=${productId}`, { method: 'DELETE' }).catch(console.error);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    let finalQuantity = quantity;
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxQty = item.product.stock || 99;
          finalQuantity = Math.min(maxQty, quantity);
          return { ...item, quantity: finalQuantity };
        }
        return item;
      })
    );

    // Sync to API
    fetch('/api/v1/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: finalQuantity }),
    }).catch(console.error);
  };

  const clearCart = () => {
    setItems([]);
    
    // Sync to API
    fetch('/api/v1/cart', { method: 'DELETE' }).catch(console.error);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const tax = Number((subtotal * ESTIMATED_TAX_RATE).toFixed(2));
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        tax,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
