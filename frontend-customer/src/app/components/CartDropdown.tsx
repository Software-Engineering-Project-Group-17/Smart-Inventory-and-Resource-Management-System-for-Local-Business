"use client";

import React, { useState } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, totalItems, totalPrice } =
    useCart();
  const { user } = useAuth();

  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Cart Icon */}
      <button
        onClick={toggleCart}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Shopping Cart</h3>
              <button
                onClick={toggleCart}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                {/* Cart Items */}
                <div className="max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.inventory_id}
                      className="flex items-center py-2 border-b"
                    >
                      <div className="relative w-12 h-12 mr-3">
                        <Image
                          src={item.image_url || "/product.png"}
                          alt={item.inventory_name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.inventory_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ${Number(item.unit_price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.inventory_id, item.quantity - 1)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.inventory_id, item.quantity + 1)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.inventory_id)}
                          className="ml-2 p-1 text-red-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold">Total:</span>
                    <span className="text-lg font-bold">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {user ? (
                    <Link href="/checkout">
                      <button
                        onClick={toggleCart}
                        className="w-full bg-zeta text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Checkout
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        toggleCart();
                        // Trigger login from context
                      }}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Login to Checkout
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={toggleCart} />}
    </div>
  );
};

export default CartDropdown;
