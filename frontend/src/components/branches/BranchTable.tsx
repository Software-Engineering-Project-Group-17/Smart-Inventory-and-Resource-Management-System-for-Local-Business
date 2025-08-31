import React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Building2, Plus } from "lucide-react";
import { Branch } from "./types";
import { BranchTableRow } from "./BranchTableRow";
import { BRANCH_CONSTANTS } from "./constants";

interface BranchTableProps {
  branches: Branch[];
  isLoading: boolean;
  searchTerm: string;
  onCreateManager: (branch: Branch) => void;
  onRemoveManager: (branch: Branch) => void;
  onLogin: (branchId: string) => void;
  onDelete: (branch: Branch) => void;
}

export const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  isLoading,
  searchTerm,
  onCreateManager,
  onRemoveManager,
  onLogin,
  onDelete,
}) => {
  const router = useRouter();

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={3} className="px-6 py-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
              <span className="text-gray-500">
                {BRANCH_CONSTANTS.messages.loading}
              </span>
            </div>
          </td>
        </tr>
      );
    }

    if (branches.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {BRANCH_CONSTANTS.messages.noResults}
              </p>
              <p className="text-gray-400">
                {searchTerm
                  ? BRANCH_CONSTANTS.messages.noResultsWithSearch
                  : BRANCH_CONSTANTS.messages.noResultsEmpty}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push("/branches/create")}
                  className="mt-4 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: BRANCH_CONSTANTS.colors.primary }}
                >
                  <Plus size={16} className="inline mr-2" />
                  {BRANCH_CONSTANTS.labels.createFirstBranch}
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: BRANCH_CONSTANTS.colors.primary }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Branch Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Employee Count
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {renderEmptyState()}
            {!isLoading &&
              branches.map((branch) => (
                <BranchTableRow
                  key={branch.id}
                  branch={branch}
                  onCreateManager={() => onCreateManager(branch)}
                  onRemoveManager={() => onRemoveManager(branch)}
                  onLogin={() => onLogin(branch.id)}
                  onDelete={() => onDelete(branch)}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
