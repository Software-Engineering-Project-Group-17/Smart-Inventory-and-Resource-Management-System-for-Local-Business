"use client";

import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import Image from "next/image";
import {
  Home,
  ShoppingBag,
  Tag,
  Phone,
  User,
  LogOut,
  LogIn,
} from "lucide-react";

const Navbar = () => {
  return (
    <div className="h-20 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative bg-white shadow-sm">
      {/* MOBILE */}
      <div className="h-full flex justify-between items-center md:hidden">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="active:scale-95 transition-transform duration-200"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={80}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Brand Name */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 hover:text-zeta transition-colors duration-200 uppercase">
              BUILD MATE
            </div>
          </Link>
        </div>

        {/* Auth & Menu */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Menu />
        </div>
      </div>

      {/* BIGGER */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Image with hover scale */}
            <div className="relative active:scale-95 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="logo"
                width={85}
                height={65}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 object-contain"
              />
            </div>

            {/* Text with hover animation */}
            <div className="flex items-center gap-2 text-lg font-bold tracking-wider uppercase group-hover:text-zeta active:scale-95 transition-all duration-200 text-gray-800">
              BUILD MATE
            </div>
          </Link>
        </div>

        {/* CENTER - Navigation Links */}
        <div className="w-1/3 flex items-center justify-center gap-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 active:scale-95 transition-all duration-200 hover:text-zeta hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <ShoppingBag size={18} /> REQUESTS
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 active:scale-95 transition-all duration-200 hover:text-zeta hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <Tag size={18} /> ORDERS
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 active:scale-95 transition-all duration-200 hover:text-zeta hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <Phone size={18} /> CONTACT
          </Link>
        </div>

        {/* RIGHT - Auth & Cart
        <div className="w-1/3 flex items-center justify-end space-x-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    {user.photoURL && (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-white shadow-sm"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[120px] truncate">
                      {customerData?.customer_name ||
                        user.displayName ||
                        "Customer"}
                    </span>
                  </div>
                  <button
                    onClick={handleAuthAction}
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-95 transition-all duration-200 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  >
                    <LogOut size={16} />
                    <span className="hidden lg:block">LOGOUT</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300"
                >
                  <LogIn size={16} />
                  <span>LOGIN</span>
                </button>
              )}
            </>
          )}
          
        </div> */}
      </div>
    </div>
  );
};

export default Navbar;
