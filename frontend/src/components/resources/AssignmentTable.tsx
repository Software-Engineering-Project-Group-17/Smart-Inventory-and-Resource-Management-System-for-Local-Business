import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  X,
  Truck,
  Loader,
} from "lucide-react";
import { Assignment } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

interface AssignmentTableProps {
  assignments: Assignment[];
  isLoading?: boolean;
  onUnassign: (assignmentId: number) => void;
  canUnassign?: boolean;
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  isLoading = false,
  onUnassign,
  canUnassign = true,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Schedule
              </th>
              {canUnassign && (
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Loading skeleton rows */}
            {[...Array(3)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Loading indicator */}
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin h-6 w-6 text-blue-600 mr-2" />
          <span className="text-gray-600">Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">
          {RESOURCE_CONSTANTS.messages.noAssignedResources}
        </p>
        <p className="text-gray-400">
          Resources will appear here when assigned
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              {RESOURCE_CONSTANTS.labels.resourceName}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              {RESOURCE_CONSTANTS.labels.purpose}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Staff Details
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              {RESOURCE_CONSTANTS.labels.timeRange}
            </th>
            {canUnassign && (
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                {RESOURCE_CONSTANTS.labels.actions}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assignments.map((assignment) => (
            <tr
              key={assignment.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">
                  {assignment.resourceName}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600">{assignment.purpose}</span>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {assignment.staffName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      {assignment.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      {assignment.phone}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar size={14} />
                    <span>
                      {assignment.startDate} - {assignment.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {assignment.startTime} - {assignment.endTime}
                    </span>
                  </div>
                </div>
              </td>
              {canUnassign && (
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onUnassign(assignment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={RESOURCE_CONSTANTS.messages.unassignResource}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
