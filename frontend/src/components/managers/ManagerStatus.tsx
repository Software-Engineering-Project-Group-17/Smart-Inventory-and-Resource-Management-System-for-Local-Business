"use client";
import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ManagerStatusProps } from "./types";
import { MANAGER_CONSTANTS } from "./managerConstants";

export const CreateManagerStatus: React.FC<ManagerStatusProps> = ({
  status,
}) => {
  if (status === "success") {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle size={20} className="text-green-600" />
        <div>
          <p className="text-green-800 font-medium">
            {MANAGER_CONSTANTS.messages.success}
          </p>
          <p className="text-green-600 text-sm">
            {MANAGER_CONSTANTS.messages.successRedirect}
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle size={20} className="text-red-600" />
        <div>
          <p className="text-red-800 font-medium">
            {MANAGER_CONSTANTS.messages.error}
          </p>
          <p className="text-red-600 text-sm">
            {MANAGER_CONSTANTS.messages.errorRetry}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
