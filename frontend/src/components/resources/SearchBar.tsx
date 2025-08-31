import React from 'react';
import { Search, Plus } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddResourceClick: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddResourceClick,
  placeholder = "Search resources by name or details..."
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
        />
      </div>
      <button
        onClick={onAddResourceClick}
        className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 font-medium"
        style={{ backgroundColor: "#3674B5" }}
      >
        <Plus size={20} />
        Add Resource
      </button>
    </div>
  );
};

export default SearchBar;