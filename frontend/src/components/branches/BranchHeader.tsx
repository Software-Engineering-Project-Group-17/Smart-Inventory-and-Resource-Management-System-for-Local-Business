import React from "react";
import { Building2 } from "lucide-react";
import { BRANCH_CONSTANTS } from "./constants";

interface BranchHeaderProps {
  currentUserEmail: string | null;
}

export const BranchHeader: React.FC<BranchHeaderProps> = ({
  currentUserEmail,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: BRANCH_CONSTANTS.colors.primary }}
        >
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {BRANCH_CONSTANTS.labels.pageTitle}
          </h1>
          <p className="text-gray-600">
            {BRANCH_CONSTANTS.labels.pageSubtitle}
          </p>
          {currentUserEmail && (
            <p className="text-sm text-gray-500 mt-1">
              Showing branches for: {currentUserEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
