import React from "react";
import { Building2 } from "lucide-react";

const PageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600">
            Manage your branch locations and staff
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;