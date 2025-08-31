import React from "react";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import { STAFF_TYPES, getTypeColor, getTypeName } from "./constants";

interface StaffFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTypes: string[];
  onTypeFilterChange: (typeId: string) => void;
  showTypeFilter: boolean;
  onToggleTypeFilter: () => void;
  onAddStaff: () => void;
}

export const StaffFilters: React.FC<StaffFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeFilterChange,
  showTypeFilter,
  onToggleTypeFilter,
  onAddStaff,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={onToggleTypeFilter}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} className="text-gray-500" />
              <span className="text-gray-700">
                Filter by Type{" "}
                {selectedTypes.length > 0 && `(${selectedTypes.length})`}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  showTypeFilter ? "rotate-180" : ""
                }`}
              />
            </button>

            {showTypeFilter && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Staff Types
                  </p>
                  <div className="space-y-2">
                    {STAFF_TYPES.map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => onTypeFilterChange(type.id)}
                          className="w-4 h-4 rounded border-gray-300"
                          style={{ accentColor: type.color }}
                        />
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {type.name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Staff Button */}
        <button
          onClick={onAddStaff}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Plus size={20} />
          <span className="font-medium">Add Staff Member</span>
        </button>
      </div>
    </div>
  );
};
