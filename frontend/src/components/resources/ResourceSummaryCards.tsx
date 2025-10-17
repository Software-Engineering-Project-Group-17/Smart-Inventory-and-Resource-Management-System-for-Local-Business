import React from "react";
import { Truck, Check, UserPlus, Target, Loader } from "lucide-react";
import { Resource, Assignment } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

interface ResourceSummaryCardsProps {
  resources: Resource[];
  assignments: Assignment[];
  isLoading?: boolean;
}

export const ResourceSummaryCards: React.FC<ResourceSummaryCardsProps> = ({
  resources,
  assignments,
  isLoading = false,
}) => {
  const availableResources = resources.filter((r) => r.isAvailable);
  const utilizationRate =
    resources.length > 0
      ? Math.round((assignments.length / resources.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gray-200">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: RESOURCE_CONSTANTS.colors.primary }}
          >
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Resources</p>
            <p className="text-2xl font-bold text-gray-900">
              {resources.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: RESOURCE_CONSTANTS.colors.success }}
          >
            <Check size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-2xl font-bold text-gray-900">
              {availableResources.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: RESOURCE_CONSTANTS.colors.warning }}
          >
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned</p>
            <p className="text-2xl font-bold text-gray-900">
              {assignments.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: RESOURCE_CONSTANTS.colors.primary }}
          >
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Utilization</p>
            <p className="text-2xl font-bold text-gray-900">
              {utilizationRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
