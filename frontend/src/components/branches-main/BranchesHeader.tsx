"use client";
import React from "react";
import { Building2 } from "lucide-react";
import { BranchesHeaderProps } from "./types";
import { BRANCHES_CONSTANTS } from "./branchesConstants";

export const BranchesHeader: React.FC<BranchesHeaderProps> = ({
  currentUserEmail,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: BRANCHES_CONSTANTS.styles.primary }}
        >
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {BRANCHES_CONSTANTS.labels.pageTitle}
          </h1>
          <p className="text-gray-600">
            {BRANCHES_CONSTANTS.labels.pageSubtitle}
          </p>
          {currentUserEmail && (
            <p className="text-sm text-gray-500 mt-1">
              {BRANCHES_CONSTANTS.labels.showingBranches} {currentUserEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
