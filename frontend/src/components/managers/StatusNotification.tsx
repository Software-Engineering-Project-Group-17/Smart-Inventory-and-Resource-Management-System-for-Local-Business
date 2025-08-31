import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SubmitStatus } from "./types";
import { MANAGER_CONSTANTS } from "./constants";

interface StatusNotificationProps {
  status: SubmitStatus;
}

export const StatusNotification: React.FC<StatusNotificationProps> = ({
  status,
}) => {
  if (status === "idle") return null;

  if (status === "success") {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle size={20} className="text-green-600" />
        <div className="flex-1">
          <p className="text-green-800 font-medium">
            {MANAGER_CONSTANTS.messages.createSuccess}
          </p>
          <p className="text-green-600 text-sm">
            {MANAGER_CONSTANTS.messages.createSuccessDesc}
          </p>
          <p className="text-green-600 text-sm font-medium">
            {MANAGER_CONSTANTS.messages.redirecting}
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
            {MANAGER_CONSTANTS.messages.createError}
          </p>
          <p className="text-red-600 text-sm">
            {MANAGER_CONSTANTS.messages.createErrorDesc}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
