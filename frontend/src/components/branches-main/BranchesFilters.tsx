"use client";
import React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import { BranchesFiltersProps } from "./types";
import { BRANCHES_CONSTANTS } from "./branchesConstants";

export const BranchesFilters: React.FC<BranchesFiltersProps> = ({
  searchTerm,
  isLoading,
  onSearch,
  onRefresh,
  onAddBranch,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={BRANCHES_CONSTANTS.labels.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            {BRANCHES_CONSTANTS.labels.refresh}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-3 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: BRANCHES_CONSTANTS.styles.primary }}
            onClick={onAddBranch}
          >
            <Plus size={20} />
            {BRANCHES_CONSTANTS.labels.addBranch}
          </button>
        </div>
      </div>
    </div>
  );
};
