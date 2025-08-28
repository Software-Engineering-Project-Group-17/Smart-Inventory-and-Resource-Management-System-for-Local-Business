"use client";
import React, { useState } from "react";
import Image from "next/image";

const images = [
  {
    id: 1,
    url: "https://images.pexels.com/photos/6538932/pexels-photo-6538932.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    url: "https://images.pexels.com/photos/6315808/pexels-photo-6315808.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    url: "https://images.pexels.com/photos/6758240/pexels-photo-6758240.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    url: "https://images.pexels.com/photos/4030908/pexels-photo-4030908.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const ProductImages = ({ items }: { items: any }) => {
  const [index, setIndex] = useState(0);

  return (
    <div>
      {/* BIG IMAGE */}
      <div className="h-[500px] relative">
        <Image
          src={items[index].image?.url}
          alt=""
          fill
          sizes="50vh"
          className="object-cover rounded-md"
        />
      </div>

      {/* SMALL IMAGES */}
      <div className="flex justify-between gap-4 mt-8">
        {items.map((item: any, i: number) => (
          <div
            className="w-1/4 gap-4 mt-8 relative h-32 cursor-pointer"
            key={i}
            onClick={() => setIndex(i)}
          >
            <Image
              src={item.image?.url}
              alt=""
              fill
              sizes="50vh"
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
