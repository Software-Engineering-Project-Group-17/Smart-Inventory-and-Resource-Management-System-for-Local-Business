import React from "react";
import { TabType } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

interface ResourceTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  resourceCount: number;
  assignmentCount: number;
}

export const ResourceTabs: React.FC<ResourceTabsProps> = ({
  activeTab,
  onTabChange,
  resourceCount,
  assignmentCount,
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        <button
          onClick={() => onTabChange("available")}
          className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
            activeTab === "available"
              ? `border-[${RESOURCE_CONSTANTS.colors.primary}] text-[${RESOURCE_CONSTANTS.colors.primary}]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {RESOURCE_CONSTANTS.tabs.allResources} ({resourceCount})
        </button>
        <button
          onClick={() => onTabChange("assigned")}
          className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
            activeTab === "assigned"
              ? `border-[${RESOURCE_CONSTANTS.colors.primary}] text-[${RESOURCE_CONSTANTS.colors.primary}]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {RESOURCE_CONSTANTS.tabs.assignedResources} ({assignmentCount})
        </button>
      </div>
    </div>
  );
};
