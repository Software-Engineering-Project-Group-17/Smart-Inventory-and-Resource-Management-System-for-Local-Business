import React from "react";
import { Save } from "lucide-react";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";

interface CreateBranchActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const CreateBranchActions: React.FC<CreateBranchActionsProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <div className="flex gap-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        disabled={isSubmitting}
      >
        {CREATE_BRANCH_CONSTANTS.messages.cancel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: CREATE_BRANCH_CONSTANTS.colors.primary }}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            {CREATE_BRANCH_CONSTANTS.messages.creating}
          </>
        ) : (
          <>
            <Save size={20} />
            {CREATE_BRANCH_CONSTANTS.messages.createBranch}
          </>
        )}
      </button>
    </div>
  );
};
