import React from "react";
import { UserPlus, Loader, Check, ChevronDown } from "lucide-react";
import { AssignmentFormData } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

interface StaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AssignmentFormProps {
  isOpen: boolean;
  resourceName: string;
  formData: AssignmentFormData;
  isLoadingStaff: boolean;
  staffMembers: StaffMember[];
  showStaffDropdown: boolean;
  onChange: (data: AssignmentFormData) => void;
  onStaffSelect: (staff: StaffMember) => void;
  onToggleStaffDropdown: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  isOpen,
  resourceName,
  formData,
  isLoadingStaff,
  staffMembers,
  showStaffDropdown,
  onChange,
  onStaffSelect,
  onToggleStaffDropdown,
  onSubmit,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (
    field: keyof AssignmentFormData,
    value: string
  ) => {
    onChange({ ...formData, [field]: value });
  };

  const isFormValid =
    formData.email &&
    formData.staffName &&
    formData.purpose &&
    formData.startDate &&
    formData.endDate;

  return (
    <tr>
      <td colSpan={4} className="px-6 py-6 bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: RESOURCE_CONSTANTS.colors.warning }}
            >
              <UserPlus size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Assign {resourceName}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Staff Member
              </label>
              <div className="relative">
                <button
                  onClick={onToggleStaffDropdown}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
                  disabled={isLoadingStaff}
                >
                  <span
                    className={
                      formData.staffName ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {formData.staffName
                      ? `${formData.staffName} (${formData.email})`
                      : "Select a staff member"}
                  </span>
                  <div className="flex items-center gap-2">
                    {isLoadingStaff && (
                      <Loader
                        size={16}
                        className="animate-spin text-[#3674B5]"
                      />
                    )}
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </button>

                {showStaffDropdown && !isLoadingStaff && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {staffMembers.length > 0 ? (
                      <div className="p-2">
                        {staffMembers.map((staff) => (
                          <button
                            key={staff.id}
                            onClick={() => onStaffSelect(staff)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {staff.firstName} {staff.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staff.email}
                            </div>
                            {staff.phone && (
                              <div className="text-sm text-gray-400">
                                {staff.phone}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No staff members found for this branch
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.staffName}
              </label>
              <input
                type="text"
                value={formData.staffName}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                placeholder={RESOURCE_CONSTANTS.messages.autoFilledFromDatabase}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.phoneNumber}
              </label>
              <input
                type="tel"
                value={formData.phone}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                placeholder={RESOURCE_CONSTANTS.messages.autoFilledFromDatabase}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.purpose}
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                placeholder={RESOURCE_CONSTANTS.placeholders.assignmentPurpose}
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.startDate}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.endDate}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {RESOURCE_CONSTANTS.labels.timeRange}
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {RESOURCE_CONSTANTS.buttons.cancel}
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
              style={{ backgroundColor: RESOURCE_CONSTANTS.colors.primary }}
              disabled={!isFormValid}
            >
              <Check size={16} />
              {RESOURCE_CONSTANTS.buttons.assign}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};
