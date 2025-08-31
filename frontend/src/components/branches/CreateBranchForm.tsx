import React from "react";
import { Building2, MapPin, Phone, FileText, AlertCircle } from "lucide-react";
import { BranchFormData, BranchFormErrors } from "./createTypes";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";

interface CreateBranchFormProps {
  formData: BranchFormData;
  errors: BranchFormErrors;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const CreateBranchForm: React.FC<CreateBranchFormProps> = ({
  formData,
  errors,
  onInputChange,
}) => {
  const getInputClassName = (hasError: boolean) => {
    return `w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
      hasError
        ? "border-red-300 focus:ring-red-500"
        : "border-gray-200 focus:ring-blue-500"
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Branch Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Building2 size={16} className="inline mr-2" />
          {CREATE_BRANCH_CONSTANTS.labels.branchName}{" "}
          {CREATE_BRANCH_CONSTANTS.labels.requiredField}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder={CREATE_BRANCH_CONSTANTS.placeholders.branchName}
          className={getInputClassName(!!errors.name)}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <MapPin size={16} className="inline mr-2" />
          {CREATE_BRANCH_CONSTANTS.labels.location}{" "}
          {CREATE_BRANCH_CONSTANTS.labels.requiredField}
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={onInputChange}
          placeholder={CREATE_BRANCH_CONSTANTS.placeholders.location}
          className={getInputClassName(!!errors.location)}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.location}
          </p>
        )}
      </div>

      {/* Contact Number */}
      <div>
        <label
          htmlFor="contactNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Phone size={16} className="inline mr-2" />
          {CREATE_BRANCH_CONSTANTS.labels.contactNumber}{" "}
          {CREATE_BRANCH_CONSTANTS.labels.requiredField}
        </label>
        <input
          type="tel"
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={onInputChange}
          placeholder={CREATE_BRANCH_CONSTANTS.placeholders.contactNumber}
          className={getInputClassName(!!errors.contactNumber)}
        />
        {errors.contactNumber && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.contactNumber}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <FileText size={16} className="inline mr-2" />
          {CREATE_BRANCH_CONSTANTS.labels.description}{" "}
          {CREATE_BRANCH_CONSTANTS.labels.optional}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder={CREATE_BRANCH_CONSTANTS.placeholders.description}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};
