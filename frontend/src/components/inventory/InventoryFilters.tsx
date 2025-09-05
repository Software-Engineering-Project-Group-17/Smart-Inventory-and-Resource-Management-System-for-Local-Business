import React from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Category, InventoryFilters } from "./types";
import { INVENTORY_CONSTANTS } from "./constants";

interface InventoryFiltersProps {
  filters: InventoryFilters;
  categories: Category[];
  onSearch: (term: string) => void;
  onCategoryFilter: (category: string) => void;
  onToggleView: () => void;
  categoriesLoading?: boolean;
}

export const InventoryFiltersComponent: React.FC<InventoryFiltersProps> = ({
  filters,
  categories,
  onSearch,
  onCategoryFilter,
  onToggleView,
  categoriesLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={INVENTORY_CONSTANTS.messages.searchPlaceholder}
            value={filters.searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <select
            value={filters.selectedCategory}
            onChange={(e) => onCategoryFilter(e.target.value)}
            disabled={categoriesLoading}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg ..."
          >
            {categoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : (
              <>
                <option value="">{INVENTORY_CONSTANTS.messages.allCategories}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* View Toggle */}
        <button
          onClick={onToggleView}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          {filters.viewMode === "list" ? (
            <>
              <Grid size={20} />
              {INVENTORY_CONSTANTS.labels.gridView}
            </>
          ) : (
            <>
              <List size={20} />
              {INVENTORY_CONSTANTS.labels.listView}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
