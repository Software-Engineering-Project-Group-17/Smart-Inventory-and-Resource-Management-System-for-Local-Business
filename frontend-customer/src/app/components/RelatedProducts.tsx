"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface RelatedProduct {
  inventory_id: number;
  inventory_name: string;
  unit_price: number;
  image_url: string | null;
  quantity: number;
  category_name: string;
}

interface RelatedProductsProps {
  categoryId?: number;
  currentProductId: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  categoryId,
  currentProductId,
}) => {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/home/products?categoryId=${categoryId}&limit=4`
      );

      if (response.ok) {
        const allProducts = await response.json();
        // Filter out the current product
        const relatedProducts = allProducts.filter(
          (product: RelatedProduct) => product.inventory_id !== currentProductId
        );
        setProducts(relatedProducts.slice(0, 3)); // Show only 3 related products
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Related Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.inventory_id}
            href={`/product/${product.inventory_id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64">
                <Image
                  src={product.image_url || "/product.png"}
                  alt={product.inventory_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.inventory_name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.category_name}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  ${Number(product.unit_price).toFixed(2)}
                </p>
                {product.quantity > 0 && (
                  <p className="text-sm text-green-600">
                    {product.quantity} in stock
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
