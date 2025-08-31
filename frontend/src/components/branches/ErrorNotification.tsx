import React from "react";
import { AlertTriangle } from "lucide-react";
import { BRANCH_CONSTANTS } from "./constants";

interface ErrorNotificationProps {
  error: string;
  onRetry: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
      <AlertTriangle size={20} className="text-red-600" />
      <div className="flex-1">
        <p className="text-red-800 font-medium">
          {BRANCH_CONSTANTS.messages.errorTitle}
        </p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
      >
        {BRANCH_CONSTANTS.messages.retryText}
      </button>
    </div>
  );
};
