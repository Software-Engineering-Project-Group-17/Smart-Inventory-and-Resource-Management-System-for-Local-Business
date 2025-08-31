import React from 'react';
import { UserPlus, Trash2, Search, Truck } from 'lucide-react';
import { Resource } from '@/types/Resources';
import AssignResourceForm from '@/components/resources/AssignResourceForm';

interface ResourcesTableProps {
  resources: Resource[];
  showAssignForm: string | null;
  assignForm: {
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
  onShowAssignForm: (resourceId: string | null) => void;
  onAssignFormChange: (data: any) => void;
  onEmailChange: (email: string) => void;
  onAssign: (resourceId: string) => void;
  onDeleteResource: (resourceId: string) => void;
  onAssignFormCancel: () => void;
}

const ResourcesTable: React.FC<ResourcesTableProps> = ({
  resources,
  showAssignForm,
  assignForm,
  isLoadingStaff,
  onShowAssignForm,
  onAssignFormChange,
  onEmailChange,
  onAssign,
  onDeleteResource,
  onAssignFormCancel
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Resource Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resources.map((resource) => (
            <React.Fragment key={resource.id}>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{resource.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{resource.details}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    resource.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {resource.isAvailable ? 'Available' : 'Assigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onShowAssignForm(showAssignForm === resource.id ? null : resource.id)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Assign Resource"
                    >
                      <UserPlus size={16} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteResource(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Assignment Form Row */}
              {showAssignForm === resource.id && (
                <AssignResourceForm
                  resource={resource}
                  formData={assignForm}
                  isLoadingStaff={isLoadingStaff}
                  onFormDataChange={onAssignFormChange}
                  onEmailChange={onEmailChange}
                  onSubmit={() => onAssign(resource.id)}
                  onCancel={onAssignFormCancel}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No resources available</p>
          <p className="text-gray-400">Add resources to get started</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesTable;