"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import RelatedProducts from "@/app/components/RelatedProducts";

interface ProductDetails {
  inventory_id: number;
  inventory_name: string;
  unit_price: number;
  image_url: string | null;
  quantity: number;
  low_stock_threshold: number;
  category_id: number;
  category_name: string;
  category_img_url: string | null;
  branch_name: string;
  branch_location: string;
  is_low_stock: boolean;
  is_in_stock: boolean;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product/${productId}`);

      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      } else if (response.status === 404) {
        setError("Product not found");
      } else {
        setError("Failed to load product");
      }
    } catch (err) {
      setError("An error occurred while loading the product");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product || !product.is_in_stock) return;

    addItem(
      {
        inventory_id: product.inventory_id,
        inventory_name: product.inventory_name,
        unit_price: product.unit_price,
        image_url: product.image_url || undefined,
        max_quantity: product.quantity,
      },
      quantity
    );

    // Show success message
    alert(`Added ${quantity} ${product.inventory_name} to cart!`);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.inventory_name,
        text: `Check out this product: ${product?.inventory_name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Product not found"}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStockStatusColor = () => {
    switch (product.stock_status) {
      case "in_stock":
        return "text-green-600";
      case "low_stock":
        return "text-yellow-600";
      case "out_of_stock":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStockStatusText = () => {
    switch (product.stock_status) {
      case "in_stock":
        return `In Stock (${product.quantity} available)`;
      case "low_stock":
        return `Low Stock (${product.quantity} left)`;
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full ${
                  isWishlisted ? "text-red-500" : "text-gray-400"
                } hover:bg-gray-100`}
              >
                <Heart
                  className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Image */}
          <div className="flex flex-col-reverse">
            <div className="aspect-w-1 aspect-h-1 w-full">
              <div className="relative w-full h-96 lg:h-[500px]">
                <Image
                  src={product.image_url || "/logo.png"}
                  alt={product.inventory_name}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Category */}
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {product.category_name}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.inventory_name}
            </h1>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-gray-900">
                ${Number(product.unit_price).toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              <p className={`text-sm font-medium ${getStockStatusColor()}`}>
                {getStockStatusText()}
              </p>
            </div>

            {/* Branch Information */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">
                Available at:
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {product.branch_name}
              </p>
              {product.branch_location && (
                <p className="text-sm text-gray-500">
                  {product.branch_location}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            {product.is_in_stock && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Quantity
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center w-16 h-10 border-t border-b border-gray-300 bg-white">
                    <span className="text-sm font-medium">{quantity}</span>
                  </div>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.quantity}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Maximum: {product.quantity} items
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  product.is_in_stock
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.is_in_stock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            {/* Product Description */}
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-4 prose prose-sm text-gray-500">
                <p>
                  Premium quality {product.inventory_name.toLowerCase()} from
                  our {product.category_name.toLowerCase()} collection. This
                  product is designed to meet professional standards and deliver
                  exceptional performance for your construction and hardware
                  needs.
                </p>
                <p className="mt-2">
                  Available exclusively at our {product.branch_name} location in{" "}
                  {product.branch_location || "your area"}.
                  {product.is_low_stock &&
                    " ⚠️ Limited stock available - order now to secure your item!"}
                </p>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900">Key Features:</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>High-quality construction materials</li>
                    <li>Professional-grade durability</li>
                    <li>Suitable for both professional and DIY use</li>
                    <li>Backed by manufacturer warranty</li>
                    {product.quantity > 10 && (
                      <li>In stock and ready for immediate delivery</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">
                Product Details
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Product ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    #{product.inventory_id}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.category_name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Stock Level:</span>
                  <span
                    className={`text-sm font-medium ${getStockStatusColor()}`}
                  >
                    {product.quantity} units
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.branch_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts
          categoryId={product.category_id}
          currentProductId={product.inventory_id}
        />
      </div>
    </div>
  );
};

export default ProductPage;
