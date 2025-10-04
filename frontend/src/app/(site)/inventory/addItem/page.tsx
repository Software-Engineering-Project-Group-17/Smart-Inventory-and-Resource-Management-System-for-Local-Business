"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  DollarSign,
  Package,
  Hash,
  AlertTriangle,
  Barcode,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";
import { getUserProfile } from "@/lib/auth";

interface Category {
  id: string;
  category_name: string;
  category_img_url?: string;
}

export default function AddItemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    inventoryName: "",
    barcode: "",
    quantity: "",
    categoryId: "",
    lowStockThreshold: "",
    unitPrice: "",
  });

  // Get user profile and show role access notification
  useEffect(() => {
    showRoleAccessNotification("Add Inventory Item");
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          toastUtils.error("Load Failed", "Failed to load categories");
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toastUtils.networkError();
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toastUtils.validationError(
          "Invalid File Type",
          "Please upload an image file (JPEG, PNG, GIF, WebP)"
        );
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toastUtils.validationError(
          "File Too Large",
          "Please upload an image smaller than 5MB"
        );
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const { inventoryName, barcode, quantity, categoryId, unitPrice } =
      formData;

    if (!inventoryName.trim()) {
      toastUtils.validationError(
        "Missing Information",
        "Item name is required"
      );
      return false;
    }
    if (!barcode.trim()) {
      toastUtils.validationError("Missing Information", "Barcode is required");
      return false;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) {
      toastUtils.validationError(
        "Invalid Quantity",
        "Please enter a valid quantity (0 or greater)"
      );
      return false;
    }

    if (!categoryId) {
      toastUtils.validationError(
        "Missing Information",
        "Please select a category"
      );
      return false;
    }

    if (!unitPrice || isNaN(Number(unitPrice)) || Number(unitPrice) < 0) {
      toastUtils.validationError(
        "Invalid Price",
        "Please enter a valid unit price (0 or greater)"
      );
      return false;
    }

    if (
      formData.lowStockThreshold &&
      (isNaN(Number(formData.lowStockThreshold)) ||
        Number(formData.lowStockThreshold) < 0)
    ) {
      toastUtils.validationError(
        "Invalid Threshold",
        "Low stock threshold must be 0 or greater"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userProfile?.email) {
      toastUtils.error(
        "Authentication Error",
        "User email not found. Please log in again."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("inventoryName", formData.inventoryName.trim());
      submitFormData.append("barcode", formData.barcode.trim());
      submitFormData.append("quantity", formData.quantity);
      submitFormData.append("categoryId", formData.categoryId);
      submitFormData.append(
        "lowStockThreshold",
        formData.lowStockThreshold || "0"
      );
      submitFormData.append("unitPrice", formData.unitPrice);
      submitFormData.append("userEmail", userProfile.email);

      if (selectedImage) {
        submitFormData.append("image", selectedImage);
      }

      const response = await fetch("/api/inventory", {
        method: "POST",
        body: submitFormData,
      });

      const data = await response.json();

      if (response.ok) {
        toastUtils.formSuccess(
          `Inventory item "${formData.inventoryName}" created successfully!`
        );

        // Reset form
        setFormData({
          inventoryName: "",
          barcode: "",
          quantity: "",
          categoryId: "",
          lowStockThreshold: "",
          unitPrice: "",
        });
        setSelectedImage(null);
        setImagePreview(null);

        // Navigate back to inventory page after a short delay
        setTimeout(() => {
          router.push("/inventory");
        }, 2000);
      } else {
        toastUtils.error(
          "Creation Failed",
          data.error || "Failed to create inventory item"
        );
      }
    } catch (error) {
      console.error("Error creating inventory item:", error);
      toastUtils.networkError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Inventory Item
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new item to your branch inventory with all the necessary
            details.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Item Name */}
            <div>
              <label
                htmlFor="inventoryName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Item Name *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="inventoryName"
                  value={formData.inventoryName}
                  onChange={(e) =>
                    handleInputChange("inventoryName", e.target.value)
                  }
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter item name"
                  required
                />
              </div>
            </div>
            {/* Item Barcode */}
            <div>
              <label
                htmlFor="inventoryBarcode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Item Barcode *
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="inventoryBarcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter item barcode"
                  required
                />
              </div>
            </div>

            {/* Quantity and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Initial Quantity *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    id="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit Price and Low Stock Threshold Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit Price */}
              <div>
                <label
                  htmlFor="unitPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Unit Price ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    id="unitPrice"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      handleInputChange("unitPrice", e.target.value)
                    }
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label
                  htmlFor="lowStockThreshold"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Low Stock Threshold
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    id="lowStockThreshold"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      handleInputChange("lowStockThreshold", e.target.value)
                    }
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 (optional)"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Alert when stock falls below this number
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image (Optional)
              </label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload an image
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF, WebP up to 5MB
                      </span>
                    </label>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Item"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Tips for adding inventory items:
          </h3>
          <ul className="text-sm text-[#3674B5] space-y-1">
            <li>• Use clear, descriptive names for easy identification</li>
            <li>• Set appropriate low stock thresholds to avoid stockouts</li>
            <li>• Upload high-quality images to help with item recognition</li>
            <li>• Double-check prices and quantities before saving</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
