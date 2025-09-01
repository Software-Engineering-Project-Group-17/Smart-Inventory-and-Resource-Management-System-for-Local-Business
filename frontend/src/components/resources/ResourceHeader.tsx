import React from "react";
import { Truck } from "lucide-react";
import { RESOURCE_CONSTANTS } from "./constants";

interface ResourceHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title = "Resource Tracking",
  subtitle = "Manage and track your business resources",
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: RESOURCE_CONSTANTS.colors.primary }}
        >
          <Truck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
