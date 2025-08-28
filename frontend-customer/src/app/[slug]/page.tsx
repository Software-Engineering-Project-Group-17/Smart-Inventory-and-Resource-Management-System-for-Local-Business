import React from "react";

import { notFound } from "next/navigation";
import ProductImages from "../components/ProductImages";
import { sampleProduct } from "@/data/data";

const SinglePage = async ({ params }: { params: { slug: string } }) => {
  const product = sampleProduct;

  const linkField = product.customTextFields?.[0];

  const link = linkField?.title;

  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative flex flex-col lg:flex-row gap-16">
      {/* IMG */}
      <div className="w-full lg:w-1/2 lg:sticky top-20 h-max">
        <ProductImages items={product.media?.items} />
      </div>

      {/* TEXT */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <h1 className="text-4xl font-serif">{product.name}</h1>
        <p className="text-black font-light">{product.description}</p>
        <div className="h-[2px] bg-gray-100" />

        {product.priceData?.discountedPrice == product.priceData?.price ? (
          <h3 className="text-3xl font-sans">$ {product.priceData?.price}</h3>
        ) : (
          <div className="flex gap-4 items-center">
            <h3 className="text-2xl text-gray-500 line-through">
              $ {product.priceData?.price}
            </h3>
            <h3 className="text-3xl font-medium">
              ${product.priceData?.discountedPrice}
            </h3>
          </div>
        )}

        <div className="h-[2px] bg-gray-100" />

        {/* <Add link={link} /> */}
      </div>
    </div>
  );
};

export default SinglePage;
