"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { showRoleAccessNotification } from "@/lib/auth";
import { toastUtils } from "@/lib/toast-utils";

interface Category {
  id: number;
  category_name: string;
  category_img_url: string | null;
  created_at: string;
  updated_at?: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    categoryName: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Show role access notification on page load
  useEffect(() => {
    showRoleAccessNotification("Category Management");
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch("/api/categories");

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        toastUtils.dataLoaded("Categories", data.categories?.length || 0);
      } else {
        toastUtils.dataError(
          "loading categories",
          "Failed to load existing categories"
        );
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toastUtils.networkError();
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      toastUtils.validationError(
        "Missing Information",
        "Please enter a category name"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("categoryName", formData.categoryName.trim());

      if (selectedImage) {
        submitFormData.append("image", selectedImage);
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok) {
        toastUtils.formSuccess(
          `Category "${formData.categoryName}" created successfully!`
        );

        // Reset form
        setFormData({ categoryName: "" });
        setSelectedImage(null);
        setImagePreview(null);

        // Reset file input
        const fileInput = document.getElementById(
          "imageInput"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        // Reload categories to show the new one
        await loadCategories();
      } else {
        if (response.status === 409) {
          toastUtils.validationError("Duplicate Category", result.error);
        } else if (response.status === 400) {
          toastUtils.validationError("Invalid Input", result.error);
        } else {
          toastUtils.error(
            "Creation Failed",
            result.error || "Failed to create category"
          );
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toastUtils.networkError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (categoryId: number, categoryName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${categoryName}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toastUtils.success(
          "Category Deleted",
          `"${categoryName}" has been deleted successfully`
        );
        await loadCategories(); // Reload categories
      } else {
        if (response.status === 409) {
          toastUtils.warning("Cannot Delete", result.error);
        } else {
          toastUtils.error(
            "Deletion Failed",
            result.error || "Failed to delete category"
          );
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toastUtils.networkError();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage inventory categories with optional images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Category Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Category
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.categoryName}
                  onChange={(e) =>
                    handleInputChange("categoryName", e.target.value)
                  }
                  placeholder="Enter category name (e.g., Electronics, Clothing)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image (Optional)
                </label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="imageInput"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload size={32} className="text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        PNG, JPG, GIF, WebP up to 5MB
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.categoryName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Category...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Create Category
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon size={24} className="text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Existing Categories
              </h2>
            </div>

            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">
                  Loading categories...
                </span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400">
                  Create your first category using the form
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {category.category_img_url ? (
                      <img
                        src={category.category_img_url}
                        alt={category.category_name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {category.category_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created{" "}
                        {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        deleteCategory(category.id, category.category_name)
                      }
                      className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete category"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
