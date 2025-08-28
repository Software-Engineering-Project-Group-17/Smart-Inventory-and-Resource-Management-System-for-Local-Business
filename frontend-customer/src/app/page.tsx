import Image from "next/image";
import Slider from "./components/Slider";
import { Suspense } from "react";
import ProductList from "./components/ProductList";
import CategoryList from "./components/CategoryList";

export default function Home() {
  return (
    <div>
      <Slider />

      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="text-2xl">Featured Products</h1>

        <ProductList
          categoryId={process.env.FEATURED_PRODUCTS_CATEGORY_ID!}
          limit={4}
        />
      </div>

      <div className="mt-24">
        <h1 className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 text-2xl">
          Categories
        </h1>

        <CategoryList />
      </div>

      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="text-2xl">New Arrivals</h1>
        <ProductList
          categoryId={process.env.NEW_PRODUCTS_CATEGORY_ID!}
          limit={4}
        />
      </div>
    </div>
  );
}
