import React from "react";
import { Search, Plus, Loader } from "lucide-react";
import { RESOURCE_CONSTANTS } from "./constants";

interface ResourceControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddResource: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const ResourceControls: React.FC<ResourceControlsProps> = ({
  searchQuery,
  onSearchChange,
  onAddResource,
  placeholder = RESOURCE_CONSTANTS.placeholders.searchResources,
  isLoading = false,
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
        onClick={onAddResource}
        disabled={isLoading}
        className={`px-6 py-3 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
          isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        }`}
        style={{ backgroundColor: RESOURCE_CONSTANTS.colors.primary }}
      >
        {isLoading ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Plus size={20} />
        )}
        {RESOURCE_CONSTANTS.buttons.addResource}
      </button>
    </div>
  );
};
