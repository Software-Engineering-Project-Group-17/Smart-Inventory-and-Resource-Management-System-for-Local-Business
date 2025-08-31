"use client";
import React from "react";
import { ArrowLeft, UserCheck } from "lucide-react";
import { ManagerHeaderProps } from "./types";
import { MANAGER_CONSTANTS } from "./managerConstants";

export const CreateManagerHeader: React.FC<ManagerHeaderProps> = ({
  branchName,
  currentUserEmail,
  onBack,
}) => {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
      >
        <ArrowLeft size={20} />
        <span>{MANAGER_CONSTANTS.labels.backToBranches}</span>
      </button>

      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: MANAGER_CONSTANTS.styles.primary }}
        >
          <UserCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {MANAGER_CONSTANTS.labels.pageTitle}
          </h1>
          <p className="text-gray-600">
            Create a new manager for{" "}
            <span className="font-medium">
              {decodeURIComponent(branchName)}
            </span>
          </p>
          {currentUserEmail && (
            <p className="text-sm text-gray-500 mt-1">
              {MANAGER_CONSTANTS.messages.creatingAs} {currentUserEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
