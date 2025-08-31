import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SubmitStatus } from "./createTypes";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";

interface CreateBranchStatusProps {
  status: SubmitStatus;
}

export const CreateBranchStatus: React.FC<CreateBranchStatusProps> = ({
  status,
}) => {
  if (status === "idle") return null;

  if (status === "success") {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle size={20} className="text-green-600" />
        <div className="flex-1">
          <p className="text-green-800 font-medium">
            {CREATE_BRANCH_CONSTANTS.messages.successTitle}
          </p>
          <p className="text-green-600 text-sm">
            {CREATE_BRANCH_CONSTANTS.messages.successDesc}
          </p>
          <p className="text-green-600 text-sm font-medium">
            {CREATE_BRANCH_CONSTANTS.messages.redirecting}
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle size={20} className="text-red-600" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">
            {CREATE_BRANCH_CONSTANTS.messages.errorTitle}
          </p>
          <p className="text-red-600 text-sm">
            {CREATE_BRANCH_CONSTANTS.messages.errorDesc}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
