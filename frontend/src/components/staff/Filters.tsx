import React from "react";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import { staffTypes } from "@/services/staffConstants";

interface StaffFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  showTypeFilter: boolean;
  setShowTypeFilter: (show: boolean) => void;
  onAddMember: () => void;
}

const StaffFilters: React.FC<StaffFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedTypes,
  setSelectedTypes,
  showTypeFilter,
  setShowTypeFilter,
  onAddMember,
}) => {
  const handleTypeFilterChange = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

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
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span
                className={
                  selectedTypes.length > 0
                    ? "text-gray-900"
                    : "text-gray-500"
                }
              >
                {selectedTypes.length > 0
                  ? `${selectedTypes.length} selected`
                  : "Filter by Role"}
              </span>
            </div>
            <ChevronDown size={20} className="text-gray-400 ml-2" />
          </button>

          {showTypeFilter && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2">
                {staffTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeFilterChange(type.id)}
                      className="rounded border-gray-300 text-[#3674B5] focus:ring-[#3674B5]"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    ></span>
                    <span className="text-sm text-gray-700">
                      {type.name}
                    </span>
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    setSelectedTypes([]);
                    setShowTypeFilter(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Member Button */}
        <button
          onClick={onAddMember}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>
    </div>
  );
};

export default StaffFilters;