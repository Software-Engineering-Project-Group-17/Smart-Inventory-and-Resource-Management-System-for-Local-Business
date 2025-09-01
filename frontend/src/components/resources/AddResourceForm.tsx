import React from "react";
import { Plus } from "lucide-react";
import { ResourceFormData } from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

interface AddResourceFormProps {
  isOpen: boolean;
  formData: ResourceFormData;
  onChange: (data: ResourceFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddResourceForm: React.FC<AddResourceFormProps> = ({
  isOpen,
  formData,
  onChange,
  onSubmit,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof ResourceFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg text-white"
          style={{ backgroundColor: RESOURCE_CONSTANTS.colors.success }}
        >
          <Plus size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          {RESOURCE_CONSTANTS.messages.addNewResource}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {RESOURCE_CONSTANTS.labels.resourceName}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder={RESOURCE_CONSTANTS.placeholders.resourceName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {RESOURCE_CONSTANTS.labels.resourceDetails}
          </label>
          <input
            type="text"
            value={formData.details}
            onChange={(e) => handleInputChange("details", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder={RESOURCE_CONSTANTS.placeholders.resourceDetails}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {RESOURCE_CONSTANTS.buttons.cancel}
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: RESOURCE_CONSTANTS.colors.success }}
          disabled={!formData.name || !formData.details}
        >
          <Plus size={16} />
          {RESOURCE_CONSTANTS.buttons.addResource}
        </button>
      </div>
    </div>
  );
};
