import React from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Category } from '@/types/Inventory';

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortByExpiry: string;
  onSortChange: (value: string) => void;
  categories: Category[];
  onAddItem: () => void;
  showCategoryDropdown: boolean;
  onToggleCategoryDropdown: () => void;
  showExpiryDropdown: boolean;
  onToggleExpiryDropdown: () => void;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortByExpiry,
  onSortChange,
  categories,
  onAddItem,
  showCategoryDropdown,
  onToggleCategoryDropdown,
  showExpiryDropdown,
  onToggleExpiryDropdown
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={onToggleCategoryDropdown}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
          >
            <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCategory || 'All Categories'}
            </span>
            <ChevronDown size={20} className="text-gray-400 ml-2" />
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    onCategoryChange('');
                    onToggleCategoryDropdown();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.name);
                      onToggleCategoryDropdown();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expiry Sort */}
        <div className="relative">
          <button
            onClick={onToggleExpiryDropdown}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
          >
            <span className={sortByExpiry ? 'text-gray-900' : 'text-gray-500'}>
              {sortByExpiry === 'earliest' ? 'Earliest First' : sortByExpiry === 'latest' ? 'Latest First' : 'Sort by Expiry'}
            </span>
            <ChevronDown size={20} className="text-gray-400 ml-2" />
          </button>
          
          {showExpiryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    onSortChange('');
                    onToggleExpiryDropdown();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  Sort by Expiry
                </button>
                <button
                  onClick={() => {
                    onSortChange('earliest');
                    onToggleExpiryDropdown();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  Earliest First
                </button>
                <button
                  onClick={() => {
                    onSortChange('latest');
                    onToggleExpiryDropdown();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  Latest First
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Item Button */}
        <button 
          onClick={onAddItem}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default InventoryFilters;