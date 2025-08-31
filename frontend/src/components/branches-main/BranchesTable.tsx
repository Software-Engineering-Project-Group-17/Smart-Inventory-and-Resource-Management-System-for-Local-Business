"use client";
import React from "react";
import {
  RefreshCw,
  Building2,
  Plus,
  User,
  Users,
  UserCheck,
  UserMinus,
  LogIn,
  Trash2,
} from "lucide-react";
import ActionButton from "@/components/Owners/ActionButton";
import { BranchesTableProps } from "./types";
import { BRANCHES_CONSTANTS } from "./branchesConstants";

export const BranchesTable: React.FC<BranchesTableProps> = ({
  branches,
  isLoading,
  searchTerm,
  onCreateManager,
  onRemoveManager,
  onLogin,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              style={{ backgroundColor: BRANCHES_CONSTANTS.styles.primary }}
            >
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  {BRANCHES_CONSTANTS.labels.branchName}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  {BRANCHES_CONSTANTS.labels.employeeCount}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                  {BRANCHES_CONSTANTS.labels.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-gray-400"
                    />
                    <span className="text-gray-500">
                      {BRANCHES_CONSTANTS.labels.loadingBranches}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: BRANCHES_CONSTANTS.styles.primary }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {BRANCHES_CONSTANTS.labels.branchName}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {BRANCHES_CONSTANTS.labels.employeeCount}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                {BRANCHES_CONSTANTS.labels.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {branches.map((branch) => (
              <tr
                key={branch.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{
                        backgroundColor: BRANCHES_CONSTANTS.styles.secondary,
                      }}
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
                        {BRANCHES_CONSTANTS.labels.managers}{" "}
                        <span className="font-semibold text-gray-900">
                          {branch.managerCount}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {BRANCHES_CONSTANTS.labels.staff}{" "}
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
                      label={BRANCHES_CONSTANTS.labels.createManager}
                      onClick={() => onCreateManager(branch.id, branch.name)}
                      variant="primary"
                    />
                    <ActionButton
                      icon={UserMinus}
                      label={BRANCHES_CONSTANTS.labels.removeManager}
                      onClick={() => onRemoveManager(branch)}
                      disabled={branch.managerCount === 0}
                    />
                    <ActionButton
                      icon={LogIn}
                      label={BRANCHES_CONSTANTS.labels.login}
                      onClick={() => onLogin(branch.id)}
                    />
                    <ActionButton
                      icon={Trash2}
                      label={BRANCHES_CONSTANTS.labels.delete}
                      onClick={() => onDelete(branch)}
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
            <p className="text-gray-500 text-lg">
              {BRANCHES_CONSTANTS.labels.noBranches}
            </p>
            <p className="text-gray-400">
              {searchTerm
                ? BRANCHES_CONSTANTS.labels.noBranchesSearch
                : BRANCHES_CONSTANTS.labels.noBranchesCreate}
            </p>
            {!searchTerm && (
              <button
                className="mt-4 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: BRANCHES_CONSTANTS.styles.primary }}
              >
                <Plus size={16} className="inline mr-2" />
                {BRANCHES_CONSTANTS.labels.createFirstBranch}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
