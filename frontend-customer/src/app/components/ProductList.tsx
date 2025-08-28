import Link from "next/link";
import Image from "next/image";
import React from "react";

import { link } from "fs";
import { sampleProducts } from "@/data/data";

const PRODUCTS_PER_PAGE = 20;

const ProductList = async ({
  categoryId,
  limit,
  searchParams,
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  return (
    <div className="flex gap-x-8 gap-y-16 flex-wrap justify-between">
      {sampleProducts.map((product) => (
        <Link
          href={"/" + product.slug}
          className="mt-12 w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
          key={product._id}
        >
          <div className="relative w-full h-80">
            <Image
              src={product.media?.mainMedia?.image?.url || "/product.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
            />

            {product.media?.items && (
              <Image
                src={product.media?.items[1]?.image?.url || "/product.png"}
                alt=""
                fill
                sizes="25vw"
                className="absolute object-cover rounded-md"
              />
            )}
          </div>
          <div className="flex flex-col flex-shrink justify-between gap-3">
            <div className="flex items-center justify-center w-full">
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex items-center justify-center w-full">
              <span className="font-semibold text-2xl">
                {"$" + product.priceData?.price}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {product.additionalInfoSections?.find(
              (section: any) => section.title === "shortDesc"
            )?.description || ""}
          </div>

          <button className="rounded-2xl ring-1 ring-zeta text-zeta py-2 px-4 text-xs hover:bg-zeta hover:text-white w-max">
            Add to Cart
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ProductList;
