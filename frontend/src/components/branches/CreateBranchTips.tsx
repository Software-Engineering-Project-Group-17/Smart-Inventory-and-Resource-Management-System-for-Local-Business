import React from "react";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";

export const CreateBranchTips: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-medium text-blue-900 mb-2">
        {CREATE_BRANCH_CONSTANTS.labels.tipsTitle}
      </h3>
      <ul className="text-sm text-blue-800 space-y-1">
        {CREATE_BRANCH_CONSTANTS.tips.map((tip, index) => (
          <li key={index}>• {tip}</li>
        ))}
      </ul>
    </div>
  );
};
