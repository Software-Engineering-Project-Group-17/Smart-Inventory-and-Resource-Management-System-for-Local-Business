import React from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";

interface CreateBranchHeaderProps {
  onBack: () => void;
}

export const CreateBranchHeader: React.FC<CreateBranchHeaderProps> = ({
  onBack,
}) => {
  return (
    <>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Back to Branches
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-3 rounded-xl text-white"
            style={{ backgroundColor: CREATE_BRANCH_CONSTANTS.colors.primary }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {CREATE_BRANCH_CONSTANTS.messages.pageTitle}
            </h1>
            <p className="text-gray-600">
              {CREATE_BRANCH_CONSTANTS.messages.pageSubtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
