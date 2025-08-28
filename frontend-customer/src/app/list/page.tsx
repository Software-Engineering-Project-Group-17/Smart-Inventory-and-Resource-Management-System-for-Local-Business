import React, { Suspense } from "react";
import Image from "next/image";

import ProductList from "../components/ProductList";

import Banner from "../components/Banner";

const page = async ({ searchParams }: { searchParams: any }) => {
  // console.log(response);

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

      {/* FILTER */}
      {/* <Filter/> */}

      {/* PRODUCTS */}
      <h1 className="mt-12 font-semibold text-xl">FOR YOU</h1>

      <ProductList categoryId="" searchParams={searchParams} />
    </div>
  );
};

export default page;
