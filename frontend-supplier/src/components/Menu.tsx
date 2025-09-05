"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import {
  LogOut,
  LogIn,
  Home,
  ShoppingBag,
  Tag,
  Phone,
  User,
} from "lucide-react";
import React from "react";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const { user, supplier, logout, loading } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await logout();
    } else {
      window.location.href = "/auth/login";
    }
    setOpen(false); // Close menu after auth action
  };

  return (
    <div>
      <Image
        src="/menu.png"
        alt="menu"
        width={28}
        height={28}
        className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 active:scale-90 active:rotate-12"
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          className="absolute bg-gradient-to-b from-gray-900 to-gray-800 text-white left-0 top-20 w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-6 text-lg z-20 shadow-2xl"
          onClick={(e) => {
            // Only close if clicking the background, not the content
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          {/* User Profile Section */}
          {!loading && user && supplier && (
            <div className="flex flex-col items-center gap-3 mb-4 pb-4 border-b border-gray-600 w-3/4">
              <User className="w-12 h-12 text-gray-300" />
              <span className="text-sm font-medium text-gray-200 text-center">
                Welcome, {supplier.supplier_name}!
              </span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
          )}

          {/* Navigation Links */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:text-blue-400 transition-colors duration-200 active:scale-95"
            onClick={() => setOpen(false)}
          >
            <ShoppingBag size={20} /> REQUESTS
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-3 hover:text-blue-400 transition-colors duration-200 active:scale-95"
            onClick={() => setOpen(false)}
          >
            <Tag size={20} /> ORDERS
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 hover:text-blue-400 transition-colors duration-200 active:scale-95"
            onClick={() => setOpen(false)}
          >
            <Phone size={20} /> CONTACT
          </Link>

          {/* Authentication Section */}
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-600 w-3/4 flex flex-col items-center gap-3">
              {user && supplier ? (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors duration-200 active:scale-95 px-4 py-2 rounded-lg border border-red-400 hover:border-red-300"
                >
                  <LogOut size={20} />
                  LOGOUT
                </button>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors duration-200 active:scale-95 px-4 py-2 rounded-lg border border-blue-400 hover:border-blue-300"
                >
                  <LogIn size={20} />
                  LOGIN
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
