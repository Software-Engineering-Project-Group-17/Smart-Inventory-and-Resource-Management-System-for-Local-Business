import React from "react";
import { UserPlus, UserMinus, LogIn, Trash2, Users, User, Building2 } from "lucide-react";
import ActionButton from "@/components/branch/ActionButton";
import { Branch } from "@/types/branches";

interface BranchesTableProps {
  branches: Branch[];
  onAddManager: (branch: Branch) => void;
  onRemoveManager: (branch: Branch) => void;
  onLogin: (branchId: string) => void;
  onDeleteBranch: (branch: Branch) => void;
}

const BranchesTable: React.FC<BranchesTableProps> = ({
  branches,
  onAddManager,
  onRemoveManager,
  onLogin,
  onDeleteBranch,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "#3674B5" }}>
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
            {branches.map((branch, index) => (
              <tr
                key={branch.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: "#FADA7A" }}
                    >
                      {branch.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {branch.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Branch #{branch.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Managers:{" "}
                        <span className="font-semibold text-gray-900">
                          {branch.managerCount}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Staff:{" "}
                        <span className="font-semibold text-gray-900">
                          {branch.staffCount}
                        </span>
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <ActionButton
                      icon={UserPlus}
                      label="Add Manager"
                      onClick={() => onAddManager(branch)}
                      variant="primary"
                    />
                    <ActionButton
                      icon={UserMinus}
                      label="Remove Manager"
                      onClick={() => onRemoveManager(branch)}
                      disabled={branch.managerCount === 0}
                    />
                    <ActionButton
                      icon={LogIn}
                      label="Login"
                      onClick={() => onLogin(branch.id)}
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Delete"
                      onClick={() => onDeleteBranch(branch)}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No branches found</p>
            <p className="text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesTable;