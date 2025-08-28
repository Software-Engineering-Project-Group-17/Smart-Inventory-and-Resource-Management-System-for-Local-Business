import React from "react";
import Link from "next/link";
import Image from "next/image";

const CategoryList = async () => {
  const sampleCategories = [
    {
      _id: "c1",
      slug: "power-tools",
      name: "Power Tools",
      media: {
        mainMedia: {
          image: { url: "/images/categories/power-tools.jpg" },
        },
      },
    },
    {
      _id: "c2",
      slug: "safety-gear",
      name: "Safety Gear",
      media: {
        mainMedia: {
          image: { url: "/images/categories/safety-gear.jpg" },
        },
      },
    },
    {
      _id: "c3",
      slug: "hand-tools",
      name: "Hand Tools",
      media: {
        mainMedia: {
          image: { url: "/images/categories/hand-tools.jpg" },
        },
      },
    },
    {
      _id: "c4",
      slug: "measuring-tools",
      name: "Measuring Tools",
      media: {
        mainMedia: {
          image: { url: "/images/categories/measuring-tools.jpg" },
        },
      },
    },
    {
      _id: "c5",
      slug: "hardware-accessories",
      name: "Hardware Accessories",
      media: {
        mainMedia: {
          image: { url: "/images/categories/hardware-accessories.jpg" },
        },
      },
    },
  ];

  return (
    <div className=" mt-12 px-4 overflow-x-scroll scrollbar-hide">
      <div className="flex gap-4 md:gap-8">
        {sampleCategories.map((item) => (
          <Link
            href={`/list?cat=${item.slug}`}
            className="flex-shrink-0 w-3/4 sm:w-1/2 lg:w-1/4 xl:w-1/6"
            key={item._id}
          >
            <div className="relative bg-slate-100 w-full h-96 mt-3">
              <Image
                src={item.media?.mainMedia?.image?.url || "/cat.png"}
                alt=""
                fill
                className="object-cover rounded-lg shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="mt-8 font-light text-xl tracking-wide">
              {item.name}
            </h1>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
