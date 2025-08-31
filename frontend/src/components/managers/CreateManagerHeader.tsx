import React from "react";
import { ArrowLeft, UserCheck, Building2 } from "lucide-react";
import { MANAGER_CONSTANTS } from "./constants";

interface CreateManagerHeaderProps {
  branchName: string;
  currentUserEmail: string | null;
  onBack: () => void;
}

export const CreateManagerHeader: React.FC<CreateManagerHeaderProps> = ({
  branchName,
  currentUserEmail,
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
            style={{ backgroundColor: MANAGER_CONSTANTS.colors.primary }}
          >
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {MANAGER_CONSTANTS.messages.pageTitle}
            </h1>
            <p className="text-gray-600">
              {MANAGER_CONSTANTS.messages.pageSubtitle}
            </p>
            {currentUserEmail && (
              <p className="text-sm text-gray-500 mt-1">
                Creating as: {currentUserEmail}
              </p>
            )}
          </div>
        </div>

        {/* Branch Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Building2 size={16} />
            {MANAGER_CONSTANTS.labels.branchInfo}
          </h3>
          <p className="text-blue-800">
            <span className="font-medium">Branch Name:</span> {branchName}
          </p>
        </div>
      </div>
    </>
  );
};
