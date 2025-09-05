import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Category } from "@/lib/api/inventory";

interface SimpleInventoryFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  showLowStockOnly: boolean;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLowStockToggle: (value: boolean) => void;
}

export const SimpleInventoryFilters: React.FC<SimpleInventoryFiltersProps> = ({
  searchTerm,
  selectedCategory,
  showLowStockOnly,
  categories,
  onSearchChange,
  onCategoryChange,
  onLowStockToggle,
}) => {
  const hasActiveFilters = searchTerm || selectedCategory || showLowStockOnly;

  const clearAllFilters = () => {
    onSearchChange("");
    onCategoryChange("");
    onLowStockToggle(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => onLowStockToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show low stock only</span>
          </label>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
