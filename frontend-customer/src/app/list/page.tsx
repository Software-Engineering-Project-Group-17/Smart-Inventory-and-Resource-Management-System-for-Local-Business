import React, { Suspense } from "react";
import Image from "next/image";

import ProductList from "../components/ProductList";

import Banner from "../components/Banner";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Get category from URL params

  const resolvedSearchParams = await searchParams;

  const categoryParam = resolvedSearchParams?.cat as string | undefined;
  let categoryName = "All Products";

  // If category is specified, convert URL param back to category name
  if (categoryParam) {
    // Convert URL param back to category name (replace hyphens with spaces and capitalize)
    categoryName = categoryParam
      .replace(/-/g, " ")
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");

    console.log("Category filtering:", { categoryParam, categoryName });
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative">
      {/* CAMPAIGN */}
      {/* <div className='hidden sm:flex bg-pink-50 h-64 px-4 justify-between'>
        <div className='w-2/3 flex flex-col items-center justify-center gap-8'>
          <h1 className='text-4xl font-semibold leading-[48px] text-gray-700'>Grab upto 50% off on <br />selected products</h1>
          <button className='rounded-3xl bg-lama text-white py-3 px-5 text-sm'>Buy Now</button>
        </div>
        <div className='w-1/3 relative'>
          <Image src="/woman.png" alt='' fill className='object-contain'/>
        </div>

      </div> */}

      {/* <div className='flex h-64 relative'>
              <Image src="/shoep.png" alt='' fill/>
          </div> */}

      <div className="">
        <Banner />
      </div>

      {/* BREADCRUMB & CATEGORY INFO */}
      <div className="mt-8">
        <div className="flex items-center text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">{">"}</span>
          <span>Products</span>
          {categoryParam && (
            <>
              <span className="mx-2">{">"}</span>
              <span className="text-gray-700 font-medium">{categoryName}</span>
            </>
          )}
        </div>
      </div>

      {/* FILTER */}
      {/* <Filter/> */}

      {/* PRODUCTS */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              {categoryParam ? categoryName : "All Products"}
            </h1>
            {categoryParam && (
              <p className="text-gray-600">
                Discover our amazing collection of {categoryName.toLowerCase()}{" "}
                products
              </p>
            )}
          </div>
          {categoryParam && (
            <div>
              <a
                href="/list"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ← View All Products
              </a>
            </div>
          )}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <ProductList
          categoryName={categoryParam ? categoryName : ""}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
};

export default page;
