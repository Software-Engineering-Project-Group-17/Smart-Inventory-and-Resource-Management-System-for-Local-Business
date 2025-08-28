import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import Image from "next/image";
import { Home, ShoppingBag, Tag, Phone, User } from "lucide-react";

const Navbar = () => {
  return (
    <div className="h-20 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative">
      {/* MOBILE */}
      <div className="h-full flex justify-between items-center md:hidden">
        {/* Logo */}
        <div className="flex-1 flex justify-start active:scale-90 transition-transform duration-200">
          <Link href="/">
            <Image src="/logo.png" alt="logo" width={95} height={74} />
          </Link>
        </div>

        {/* Link */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <div className="flex items-center gap-2 text-[18px] tracking-wide hover:text-zeta">
              INVENTORY SHOP
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 flex justify-end">
          <Menu />
        </div>
      </div>

      {/* BIGGER */}

      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Image with hover scale */}
            <div className="relative active:scale-90 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="logo"
                width={94}
                height={74}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
            </div>

            {/* Text with hover animation */}
            <div className="flex items-center gap-2 text-xl tracking-wide uppercase group-hover:text-zeta active:scale-90 transition-transform duration-200">
              BUILD MATE
            </div>
          </Link>
        </div>

        {/* RIGHT */}
        <div className="w-2/3 xl:w-1/2 flex items-center justify-center gap-10 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-gray-700 active:scale-90 transition-transform duration-200 hover:text-zeta"
          >
            <Home size={20} /> HOME
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-lg font-semibold text-gray-700 active:scale-90 transition-transform duration-200 hover:text-zeta"
          >
            <ShoppingBag size={20} /> SHOP
          </Link>
          <div className="">
            <Link
              href="/list?cat=deals"
              className="flex items-center gap-2 text-lg font-semibold text-gray-700 active:scale-90 transition-transform duration-200 hover:text-zeta"
            >
              <Tag size={20} /> DEALS
            </Link>
          </div>
          <Link
            href="https://www.facebook.com/share/15fhkFjWj3/?mibextid=wwXIfr"
            className="flex items-center gap-2 text-lg font-semibold text-gray-700 active:scale-90 transition-transform duration-200 hover:text-zeta"
          >
            <Phone size={20} /> CONTACT
          </Link>
        </div>

        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-gray-700 active:scale-90 transition-transform duration-200 hover:text-zeta"
          >
            <User size={20} /> PROFILE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
