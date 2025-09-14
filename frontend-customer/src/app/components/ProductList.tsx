import Link from "next/link";
import Image from "next/image";
import React from "react";

interface Product {
  inventory_id: number;
  inventory_name: string;
  unit_price: number;
  image_url: string | null;
  quantity: number;
  category_name: string;
}

const PRODUCTS_PER_PAGE = 20;

const ProductList = async ({
  categoryName,
  categoryId,
  limit,
  searchParams,
}: {
  categoryName?: string;
  categoryId?: string;
  limit?: number;
  searchParams?: any;
}) => {
  // Fetch products from the API
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    const params = new URLSearchParams();

    // Use categoryName if provided, otherwise fall back to categoryId
    if (categoryName && categoryName !== "") {
      params.append("categoryName", categoryName);
      console.log("Filtering by categoryName:", categoryName);
    } else if (categoryId && categoryId !== "all" && categoryId !== "") {
      params.append("categoryId", categoryId);
      console.log("Filtering by categoryId:", categoryId);
    }

    if (limit) {
      params.append("limit", limit.toString());
    }

    const apiUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
    }/api/home/products?${params.toString()}`;

    console.log("Fetching products from:", apiUrl);

    const response = await fetch(apiUrl, {
      cache: "no-store", // Ensure fresh data on each request
    });

    if (response.ok) {
      products = await response.json();
    } else {
      console.error("Failed to fetch products:", response.statusText);
      errorMessage = "Failed to load products. Please try again.";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    errorMessage = "Network error. Please check your connection.";
  }
  return (
    <div className="flex gap-x-8 gap-y-16 flex-wrap justify-between">
      {errorMessage ? (
        <div className="flex items-center justify-center w-full h-80">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">⚠️ {errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : products.length > 0 ? (
        products.map((product) => (
          <Link
            href={`/product/${product.inventory_id}`}
            className="mt-12 w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
            key={product.inventory_id}
          >
            <div className="relative w-full h-80">
              <Image
                src={product.image_url || "/product.png"}
                alt={product.inventory_name}
                fill
                sizes="25vw"
                className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
              />
              {/* Placeholder for second image on hover */}
              <Image
                src={product.image_url || "/product.png"}
                alt={product.inventory_name}
                fill
                sizes="25vw"
                className="absolute object-cover rounded-md"
              />
            </div>
            <div className="flex flex-col flex-shrink justify-between gap-3">
              <div className="flex items-center justify-center w-full">
                <span className="font-medium">{product.inventory_name}</span>
              </div>
              <div className="flex items-center justify-center w-full">
                <span className="font-semibold text-2xl">
                  {"$" + Number(product.unit_price).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {product.category_name && `Category: ${product.category_name}`}
              {product.quantity > 0 ? (
                <span className="block text-green-600">
                  In Stock ({product.quantity})
                </span>
              ) : (
                <span className="block text-red-600">Out of Stock</span>
              )}
            </div>

            <button
              className={`rounded-2xl ring-1 ring-zeta text-zeta py-2 px-4 text-xs hover:bg-zeta hover:text-white w-max ${
                product.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={product.quantity === 0}
            >
              {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </Link>
        ))
      ) : (
        <div className="flex items-center justify-center w-full h-80">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            {(categoryId || categoryName) && (
              <p className="text-gray-400 text-sm">
                Try browsing other categories or{" "}
                <a
                  href="/list"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  view all products
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
