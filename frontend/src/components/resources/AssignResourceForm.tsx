import React from 'react';
import { UserPlus, Check, Loader } from 'lucide-react';
import { Resource } from '@/types/Resources';

interface AssignResourceFormProps {
  resource: Resource;
  formData: {
    email: string;
    staffName: string;
    phone: string;
    purpose: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  isLoadingStaff: boolean;
  onFormDataChange: (data: any) => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AssignResourceForm: React.FC<AssignResourceFormProps> = ({
  resource,
  formData,
  isLoadingStaff,
  onFormDataChange,
  onEmailChange,
  onSubmit,
  onCancel
}) => {
  return (
    <tr>
      <td colSpan={4} className="px-6 py-6 bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: "#FADA7A" }}
            >
              <UserPlus size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Assign {resource.name}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent pr-10"
                  placeholder="Enter staff email"
                />
                {isLoadingStaff && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader size={16} className="animate-spin text-[#3674B5]" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
              <input
                type="text"
                value={formData.staffName}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled from database"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled from database"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => onFormDataChange({...formData, purpose: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                placeholder="Enter assignment purpose"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormDataChange({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormDataChange({...formData, endDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => onFormDataChange({...formData, startTime: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => onFormDataChange({...formData, endTime: e.target.value})}
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
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#3674B5" }}
              disabled={!formData.email || !formData.staffName || !formData.purpose || !formData.startDate || !formData.endDate}
            >
              <Check size={16} />
              Assign Resource
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default AssignResourceForm;