import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <div>
      {/* TOP */}
      <div className="py-24 flex flex-col md:flex-row justify-between gap-24 mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-gray-100 text-sm">
        {/* LEFT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <Link href="/">
            <div className="text-2xl tracking-wide">OUR INVENTORY</div>
          </Link>

          <div className="flex gap-6">
            {/* <Link href="https://www.instagram.com/yoo_sian_"><Image src="/instagram.png" alt="" width={16} height={16}/></Link> */}
            <Link href="/">
              <Image src="/instagram.png" alt="" width={16} height={16} />
            </Link>
            {/* <Link href="https://www.facebook.com/share/15fhkFjWj3/?mibextid=wwXIfr"><Image src="/facebook.png" alt="" width={16} height={16}/></Link> */}
            <Link href="/">
              <Image src="/facebook.png" alt="" width={16} height={16} />
            </Link>
            <Link href="https://pin.it/4ttbQwLNh">
              <Image src="/pinterest.png" alt="" width={16} height={16} />
            </Link>
            <Image src="/youtube.png" alt="" width={16} height={16} />
            <Image src="/x.png" alt="" width={16} height={16} />
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden lg:flex justify-between w-1/2">
          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg mb-3">COMPANY</h1>
            <div className="flex flex-col gap-6">
              <p>About Us</p>
              <p>Careers</p>
              <p>Affiliates</p>
              <p>Blog</p>
              <p>Contact Us</p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg">SHOP</h1>
            <div className="flex flex-col gap-6">
              <p>New Arrivals</p>
              <p>Accessories</p>
              <p>Men</p>
              <p>Women</p>
              <p>All Products</p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg">HELP</h1>
            <div className="flex flex-col gap-6">
              <p>Customer Service</p>
              <p>My Account</p>
              <p>Find a Store</p>
              <p>Legal & Privacy</p>
              <p>Gift Card</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <span className="font-semibold">Secure Payments</span>

          <div className="flex justify-between">
            <Image src="/discover.png" alt="" width={40} height={20} />
            <Image src="/skrill.png" alt="" width={40} height={20} />
            <Image src="/paypal.png" alt="" width={40} height={20} />
            <Image src="/mastercard.png" alt="" width={40} height={20} />
            <Image src="/visa.png" alt="" width={40} height={20} />
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-gray-100 text-sm">
        <div className="">© 2025 OUR INVENTORY</div>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="">
            <span className="text-gray-500 mr-4">Language </span>
            <span className="font-medium">United States | English </span>
          </div>
          <div className="">
            <span className="text-gray-500">Currency </span>
            <span className="font-medium">$ USD </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
