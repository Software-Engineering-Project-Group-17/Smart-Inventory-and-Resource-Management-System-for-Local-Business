"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  inventory_id: number;
  inventory_name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
  max_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (inventory_id: number) => void;
  updateQuantity: (inventory_id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Omit<CartItem, "quantity">, quantity: number) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.inventory_id === product.inventory_id
      );

      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.max_quantity
        );
        return currentItems.map((item) =>
          item.inventory_id === product.inventory_id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        return [...currentItems, { ...product, quantity }];
      }
    });
  };

  const removeItem = (inventory_id: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.inventory_id !== inventory_id)
    );
  };

  const updateQuantity = (inventory_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(inventory_id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.inventory_id === inventory_id
          ? { ...item, quantity: Math.min(quantity, item.max_quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
