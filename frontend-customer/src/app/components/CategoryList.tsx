import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  category_name: string;
  category_img_url: string | null;
}

const CategoryList: React.FC = async () => {
  // Fetch categories from the API
  let categories: Category[] = [];

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
      }/api/home/categories`,
      {
        cache: "no-store", // Ensure fresh data on each request
      }
    );

    if (response.ok) {
      categories = await response.json();
    } else {
      console.error("Failed to fetch categories:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="mt-12 px-4 overflow-x-scroll scrollbar-hide">
      <div className="flex gap-4 md:gap-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              href={`/list?cat=${category.category_name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="flex-shrink-0 w-3/4 sm:w-1/2 lg:w-1/4 xl:w-1/6"
              key={category.id}
            >
              <div className="relative bg-slate-100 w-full h-96 mt-3">
                <Image
                  src={category.category_img_url || "/cat.png"}
                  alt={category.category_name}
                  fill
                  className="object-cover rounded-lg shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </div>
              <h1 className="mt-8 font-light text-xl tracking-wide">
                {category.category_name}
              </h1>
            </Link>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-96">
            <p className="text-gray-500 text-lg">No categories available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
