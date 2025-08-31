import React from "react";
import { useRouter } from "next/navigation";
import { User, Users, UserCheck, UserMinus, LogIn, Trash2 } from "lucide-react";
import ActionButton from "@/components/Owners/ActionButton";
import { Branch } from "./types";
import { BRANCH_CONSTANTS } from "./constants";

interface BranchTableRowProps {
  branch: Branch;
  onCreateManager: () => void;
  onRemoveManager: () => void;
  onLogin: () => void;
  onDelete: () => void;
}

export const BranchTableRow: React.FC<BranchTableRowProps> = ({
  branch,
  onCreateManager,
  onRemoveManager,
  onLogin,
  onDelete,
}) => {
  const router = useRouter();

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: BRANCH_CONSTANTS.colors.secondary }}
          >
            {branch.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{branch.name}</div>
            <div className="text-sm text-gray-500">
              {BRANCH_CONSTANTS.labels.branchNumber}
              {branch.id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {BRANCH_CONSTANTS.labels.managers}:{" "}
              <span className="font-semibold text-gray-900">
                {branch.managerCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {BRANCH_CONSTANTS.labels.staff}:{" "}
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
            icon={UserCheck}
            label={BRANCH_CONSTANTS.actions.createManager}
            onClick={() =>
              router.push(
                `/managers/create?branchId=${
                  branch.id
                }&branchName=${encodeURIComponent(branch.name)}`
              )
            }
            variant="primary"
          />
          <ActionButton
            icon={UserMinus}
            label={BRANCH_CONSTANTS.actions.removeManager}
            onClick={onRemoveManager}
            disabled={branch.managerCount === 0}
          />
          <ActionButton
            icon={LogIn}
            label={BRANCH_CONSTANTS.actions.login}
            onClick={onLogin}
          />
          <ActionButton
            icon={Trash2}
            label={BRANCH_CONSTANTS.actions.delete}
            onClick={onDelete}
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
};
