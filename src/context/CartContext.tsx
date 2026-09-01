"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";
import { useLanguage } from "./LanguageContext";

export interface CartItem {
  id: string; // Composite ID: `${productId}_${size || 'default'}_${color || 'default'}`
  productId: string;
  name: string;
  price: number; // Base price in EGP
  originalPrice?: number;
  imageUrl: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  sourceUrl?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  addToCart: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "beleco_cart_items";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();
  const { lang } = useLanguage();

  // Load cart from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save cart to storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, isLoaded]);

  const addToCart = (itemData: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    const size = itemData.selectedSize || "M";
    const color = itemData.selectedColor || "default";
    const compositeId = `${itemData.productId}_${size}_${color}`;
    const quantityToAdd = itemData.quantity && itemData.quantity > 0 ? itemData.quantity : 1;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === compositeId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantityToAdd;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...itemData,
            id: compositeId,
            selectedSize: size,
            selectedColor: color,
            quantity: quantityToAdd,
          },
        ];
      }
    });

    showToast(
      lang === "ar"
        ? `تمت إضافة "${itemData.name}" إلى الشنطة`
        : `Added "${itemData.name}" to your bag`,
      "success"
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast(
      lang === "ar" ? "تمت إزالة القطعة من الشنطة" : "Item removed from bag",
      "info"
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 0 : 0; // Free / calculated at delivery
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
