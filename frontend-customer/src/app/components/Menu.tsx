"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import React from "react";

const Menu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Image
        src="/menu.png"
        alt="menu"
        width={28}
        height={28}
        className="curser-pointer transition-transform duration-200 ease-in-out hover:scale-110 active:scale-90 active:rotate-12"
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          className="absolute bg-[#545454] text-white left-0 top-20 w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-xl z-20"
          onClick={() => setOpen((prev) => !prev)}
        >
          {/* <Image src="/logo.webp" alt="" width={200} height={300} /> */}
          <Link href="/">HOME</Link>
          <Link href="/shop">SHOP</Link>
          <Link href="/list?cat=deals">DEALS</Link>
          <Link href="/">CONTACT</Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
