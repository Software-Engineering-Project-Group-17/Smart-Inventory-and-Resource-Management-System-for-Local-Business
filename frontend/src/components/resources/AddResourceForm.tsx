import React from 'react';
import { Plus } from 'lucide-react';

interface AddResourceFormProps {
  showForm: boolean;
  formData: {
    name: string;
    details: string;
  };
  onFormDataChange: (data: { name: string; details: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({
  showForm,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  if (!showForm) return null;

  return (
    <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg text-white"
          style={{ backgroundColor: "#10B981" }}
        >
          <Plus size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Add New Resource</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter resource name (e.g., Delivery Truck - ABC-123)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resource Details</label>
          <input
            type="text"
            value={formData.details}
            onChange={(e) => onFormDataChange({...formData, details: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter resource details and specifications"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: "#10B981" }}
          disabled={!formData.name || !formData.details}
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>
    </div>
  );
};

export default AddResourceForm;