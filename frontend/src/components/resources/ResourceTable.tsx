import React from "react";
import { UserPlus, Trash2, Search, Truck, Loader } from "lucide-react";
import { Resource } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";
import { AssignmentForm } from "./AssignmentForm";

interface StaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface ResourceTableProps {
  resources: Resource[];
  isLoading?: boolean;
  showAssignForm: number | null;
  assignFormData: any;
  isLoadingStaff: boolean;
  staffMembers: StaffMember[];
  showStaffDropdown: boolean;
  onAssignClick: (resourceId: number) => void;
  onDeleteClick: (resourceId: number) => void;
  onAssignFormChange: (data: any) => void;
  onStaffSelect: (staff: StaffMember) => void;
  onToggleStaffDropdown: () => void;
  onAssignSubmit: (resourceId: number) => void;
  onAssignCancel: () => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  isLoading = false,
  showAssignForm,
  assignFormData,
  isLoadingStaff,
  staffMembers,
  showStaffDropdown,
  onAssignClick,
  onDeleteClick,
  onAssignFormChange,
  onStaffSelect,
  onToggleStaffDropdown,
  onAssignSubmit,
  onAssignCancel,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {RESOURCE_CONSTANTS.labels.resourceName}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Details
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {RESOURCE_CONSTANTS.labels.status}
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                {RESOURCE_CONSTANTS.labels.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Loading skeleton rows */}
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
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
          <span className="text-gray-600">Loading resources...</span>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">
          {RESOURCE_CONSTANTS.messages.noResourcesFound}
        </p>
        <p className="text-gray-400">Try adjusting your search query</p>
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
              Details
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              {RESOURCE_CONSTANTS.labels.status}
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
              {RESOURCE_CONSTANTS.labels.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resources.map((resource) => (
            <React.Fragment key={resource.id}>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {resource.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{resource.details}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resource.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {resource.isAvailable
                      ? RESOURCE_CONSTANTS.statuses.available
                      : RESOURCE_CONSTANTS.statuses.assigned}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onAssignClick(resource.id)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title={RESOURCE_CONSTANTS.messages.assignResource}
                    >
                      <UserPlus size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteClick(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={RESOURCE_CONSTANTS.messages.deleteResource}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Assignment Form Row */}
              {showAssignForm === resource.id && (
                <AssignmentForm
                  isOpen={true}
                  resourceName={resource.name}
                  formData={assignFormData}
                  isLoadingStaff={isLoadingStaff}
                  staffMembers={staffMembers}
                  showStaffDropdown={showStaffDropdown}
                  onChange={onAssignFormChange}
                  onStaffSelect={onStaffSelect}
                  onToggleStaffDropdown={onToggleStaffDropdown}
                  onSubmit={() => onAssignSubmit(resource.id)}
                  onCancel={onAssignCancel}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
