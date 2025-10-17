"use client";
import React from "react";
import {
  X,
  Users,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  DollarSign,
  MapPin,
  Trash2,
} from "lucide-react";
import { useBranchUsers } from "@/hooks/useBranchUsers";
import { BranchUser } from "@/lib/api/branchUsers";

interface BranchUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  branchName: string;
}

const BranchUsersModal: React.FC<BranchUsersModalProps> = ({
  isOpen,
  onClose,
  branchId,
  branchName,
}) => {
  const {
    branchUsers,
    isLoading,
    error,
    fetchBranchUsers,
    deactivateUser,
    isDeactivating,
  } = useBranchUsers();

  // Load data when modal opens
  React.useEffect(() => {
    if (isOpen && branchId) {
      fetchBranchUsers(branchId);
    }
  }, [isOpen, branchId]);

  const handleDeactivateUser = async (user: BranchUser) => {
    const userName =
      user.name || `${user.firstName} ${user.lastName}` || user.email;
    const confirmMessage = `Are you sure you want to deactivate ${user.role} "${userName}"? They will no longer be able to log in.`;

    if (confirm(confirmMessage)) {
      await deactivateUser(user.userId, userName, user.role);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return "Not set";
    return `LKR ${salary.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-[#3674B5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-white" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Branch Users
                </h2>
                <p className="text-blue-100">{branchName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3674B5] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading branch users...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 text-red-300 mx-auto mb-4" />
              <p className="text-red-500 text-lg">Error loading users</p>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => fetchBranchUsers(branchId)}
                className="px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}

          {branchUsers && !isLoading && !error && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Managers</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {branchUsers.counts.activeManagers}/
                        {branchUsers.counts.totalManagers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Staff</p>
                      <p className="text-2xl font-bold text-green-900">
                        {branchUsers.counts.activeStaff}/
                        {branchUsers.counts.totalStaff}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-600">Active Users</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {branchUsers.counts.activeManagers +
                          branchUsers.counts.activeStaff}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <UserX className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600">Inactive Users</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {branchUsers.counts.totalManagers -
                          branchUsers.counts.activeManagers +
                          (branchUsers.counts.totalStaff -
                            branchUsers.counts.activeStaff)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Managers Section */}
              {branchUsers.branchManagers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Branch Managers ({branchUsers.branchManagers.length})
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Manager
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Manager Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {branchUsers.branchManagers.map((manager) => (
                            <tr
                              key={manager.userId}
                              className={
                                !manager.isActive ? "bg-gray-50 opacity-60" : ""
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {manager.name ||
                                        `${manager.firstName} ${manager.lastName}` ||
                                        "Unnamed Manager"}
                                      {!manager.isActive && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                          Deactivated
                                        </span>
                                      )}
                                      {manager.managerStatus === "PREVIOUS" && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                          Previous Manager
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {manager.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    manager.managerStatus === "CURRENT"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {manager.managerStatus === "CURRENT"
                                    ? "Current Manager"
                                    : "Previous Manager"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    manager.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {manager.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {manager.lastLogin
                                  ? formatDate(manager.lastLogin)
                                  : "Never"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(manager.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {manager.isActive && (
                                  <button
                                    onClick={() =>
                                      handleDeactivateUser(manager)
                                    }
                                    disabled={isDeactivating}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Deactivate Manager"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Members Section */}
              {branchUsers.staff.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Staff Members ({branchUsers.staff.length})
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Types
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hire Date
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {branchUsers.staff.map((staff) => (
                            <tr
                              key={staff.userId}
                              className={
                                !staff.isUserActive || !staff.isStaffActive
                                  ? "bg-gray-50 opacity-60"
                                  : ""
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {staff.firstName && staff.lastName
                                        ? `${staff.firstName} ${staff.lastName}`
                                        : staff.name || "Unnamed Staff"}
                                      {(!staff.isUserActive ||
                                        !staff.isStaffActive) && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                          Deactivated
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {staff.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-1 flex-wrap">
                                  {staff.staffTypes?.map((type, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                    >
                                      {type}
                                    </span>
                                  )) || (
                                    <span className="text-gray-400">
                                      No types
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatSalary(staff.salary)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    staff.isUserActive && staff.isStaffActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {staff.isUserActive && staff.isStaffActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {staff.hireDate
                                  ? formatDate(staff.hireDate)
                                  : "Not set"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {staff.isUserActive && staff.isStaffActive && (
                                  <button
                                    onClick={() => handleDeactivateUser(staff)}
                                    disabled={isDeactivating}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Deactivate Staff Member"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!branchUsers.branchManagers.length &&
                !branchUsers.staff.length && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400">
                      This branch doesn't have any managers or staff members
                      yet.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchUsersModal;
