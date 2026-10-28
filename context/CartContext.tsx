"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { MenuItem } from "@/lib/db";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "smartx_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCartItems(parsed as CartItem[]);
        }
      }
    } catch {
      // Malformed data — start with empty cart
    }
    setHydrated(true);
  }, []);

  // Persist to sessionStorage whenever cartItems changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // sessionStorage unavailable — silently skip
    }
  }, [cartItems, hydrated]);

  function addItem(menuItem: MenuItem) {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === menuItem.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci
      )
    );
  }

  function removeItem(menuItemId: string) {
    setCartItems((prev) => prev.filter((ci) => ci.menuItem.id !== menuItemId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const subtotal =
    Math.round(
      cartItems.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0) *
        100
    ) / 100;

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, updateQuantity, removeItem, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
