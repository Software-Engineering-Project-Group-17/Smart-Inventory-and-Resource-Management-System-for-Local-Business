"use client";
import React from "react";
import { Building2 } from "lucide-react";
import { MANAGER_CONSTANTS } from "./managerConstants";

interface BranchInfoProps {
  branchId: string;
  branchName: string;
}

export const BranchInfo: React.FC<BranchInfoProps> = ({
  branchId,
  branchName,
}) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Building2 size={20} className="text-blue-600" />
        <div>
          <h3 className="font-medium text-blue-900">
            {MANAGER_CONSTANTS.labels.branchDetails}
          </h3>
          <p className="text-blue-700">
            {decodeURIComponent(branchName)} (ID: {branchId})
          </p>
        </div>
      </div>
    </div>
  );
};
